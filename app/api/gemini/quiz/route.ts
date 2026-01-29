import { NextRequest, NextResponse } from 'next/server';
import { ExamMode } from '../../../../types';
import { MODEL_FLASH } from '../../../../constants';
import { getUserFromRequest } from '@/lib/auth';
import { checkAndDeductUsage } from '@/lib/checkUsageLimit';
import dbConnect from '@/lib/db';
import User from '@/models/User';
const pdf = require('pdf-parse');

const apiKey = process.env.GEMINI_API_KEY;
const baseUrl = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com';
if (!apiKey) {
  console.error('GEMINI_API_KEY not found in environment variables');
}

export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户登录
    const payload = getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    // 2. 检查使用次数
    const usageCheck = await checkAndDeductUsage(payload.userId);
    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: usageCheck.reason,
          needUpgrade: true,
          remaining: usageCheck.remaining
        },
        { status: 403 }
      );
    }

    // 3. 继续原有的AI调用逻辑
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key not configured' },
        { status: 500 }
      );
    }

    // 4. 获取用户最近的做题历史 (防重复)
    let recentQuestionsText = "";
    try {
        await dbConnect();
        // Fetch only the messages field, slice last 20 messages to save bandwidth/memory
        // We cast to any because the projection syntax with Mongoose + Typescript can be tricky
        const user = await User.findById(payload.userId).select({ 'data.messages': { $slice: -20 } }).lean() as any;
        
        if (user && user.data && user.data.messages) {
            const recentQuizzes = user.data.messages
                .filter((m: any) => m.quizData && m.quizData.length > 0)
                .flatMap((m: any) => m.quizData)
                .map((q: any) => q.question ? q.question.substring(0, 50) : "") // Take first 50 chars as signature
                .filter((t: string) => t.length > 5)
                .slice(-30); // Keep last 30 questions
            
            if (recentQuizzes.length > 0) {
                recentQuestionsText = recentQuizzes.join("\n- ");
            }
        }
    } catch (dbError) {
        console.warn("Failed to fetch history for dedup", dbError);
        // Continue without dedup if DB fails
    }

    let mode: ExamMode;
    let topic: string;
    let count: number;
    let fileContent = '';

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      mode = formData.get('mode') as ExamMode;
      topic = formData.get('topic') as string;
      count = parseInt(formData.get('count') as string || '5');
      
      const file = formData.get('file') as File | null;
      if (file) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const data = await pdf(buffer);
          fileContent = data.text.slice(0, 30000); // Limit context window
        } catch (e) {
          console.error("PDF Parse Error", e);
        }
      }
    } else {
      const json = await request.json();
      mode = json.mode;
      topic = json.topic;
      count = json.count || 5;
    }

    const modelName = MODEL_FLASH;
    let prompt = '';

    const contextInstruction = fileContent 
      ? `\n\n【参考真题内容】：\n${fileContent}\n\n请仔细分析上述提供的真题文档的 难度系数、出题风格、语言习惯 和 考点分布。请务必生成与该文档风格和难度高度一致的题目。不要直接复制原题，而是生成“同源”的新题。`
      : '';

    // 防重复指令
    const dedupInstruction = recentQuestionsText 
      ? `\n\n【避坑指南（用户近期已做过以下题目，严禁重复）】：\n- ${recentQuestionsText}\n\n请确保新生成的题目在 题干素材、数值设定、逻辑陷阱 上与上述列表完全不同。`
      : '';

    if (mode === ExamMode.SHEN_LUN) {
      prompt = `
        请生成 1 道【申论 (Essay Writing)】模拟题。
        主题：${topic || '社会热点'}。
        ${contextInstruction}
        ${dedupInstruction}

        要求：
        1. 返回纯 JSON 数组格式，只包含 1 个对象。
        2. JSON 字段包含：id, material (给定资料 300字+), question, answer (参考范文), analysis (解析), options: null。
      `;
    } else {
      const isGraphicReasoning = topic?.includes('图形推理');

      prompt = `
        请生成 ${count} 道 ${mode === ExamMode.MIAN_SHI ? '面试' : '行测'} 题目。
        主题：${topic || '随机'}。
        **难度：极高（严格对标中国国家公务员考试(国考)及省级公务员考试(省考)真题难度）。**
        ${dedupInstruction}

        【核心要求】：
        1. **拒绝低幼化/简单题**：严禁生成一眼能看穿的题目。必须具备高选拔性。
        2. **强干扰项设计**：错误选项（干扰项）必须具有极强的迷惑性。必须基于常见的思维陷阱、近义词混淆、计算易错点或逻辑漏洞来设计错误选项。禁止出现凑数的“一眼假”选项。
        3. **分题型高标准**：
           - **言语理解**：选材需来自官方主流媒体（如人民日报、求是）或学术文献。逻辑填空侧重实词/成语的微殊辨析；片段阅读侧重行文脉络分析，避免单纯的信息匹配。
           - **判断推理**：
             - **逻辑判断**：削弱/加强题要有力度区分（最能/最不能）；形式逻辑要有复杂的推理链条。
             - **定义判断**：定义项应包含多重限定（主体、客体、手段、目的），题干设置边缘案例。
             - **图形推理**：规律必须隐蔽且复合（如：对称性+旋转、面数量+一笔画、黑白运算+移动）。拒绝简单的单一规律。
           - **资料分析/数量关系**：数据不能整除，必须考察估算、截位法、单位陷阱或多步计算逻辑。
           - **常识判断**：考察知识点要细致，结合最新时政、法律细节或科技原理，避免常识性的大路货。

        ${contextInstruction}

        格式要求：
        1. 返回纯 JSON 数组。
        2. 包含字段：id, question, options (数组), answer, analysis (解析需详细，指出易错点)。
        
        ${isGraphicReasoning ? `
        3. **图形推理（结构化数据模式）**：
           为了精确渲染，请不要返回 SVG 字符串，而是返回 **JSON 结构化数据** 的字符串形式。
           
           - **question 字段**：请返回符合以下结构的 JSON **字符串**（注意是字符串化后的 JSON）：
             \`\`\`json
             {
               "layout": "matrix_3x3" | "sequence_4" | "sequence_5",
               "cells": [ // 题目中的图形单元格
                 {
                   "elements": [
                     {
                       "type": "dot_matrix" | "circle" | "rect" | "line",
                       // dot_matrix 特有:
                       "matrixRows": 3, "matrixCols": 3, "matrixData": [1,0,1, 0,1,0, 1,0,1], // 1=黑, 0=白, 2=空
                       // 几何图形特有 (0-100 坐标系):
                       "x": 50, "y": 50, "w": 30, "h": 30, "fill": "black"|"white"|"none", "stroke": true, "rotation": 0
                     }
                   ]
                 }
               ]
             }
             \`\`\`
           
           - **options 字段**：字符串数组，每个元素也是一个符合 \`{ "elements": [...] }\` 结构的 JSON **字符串**。
           
           - **典型题型举例**：
             - **黑白点移动/叠加**：请使用 \`dot_matrix\` 类型，定义 3x3 或 4x4 网格数据。
             - **几何规律**：使用 \`circle\`, \`rect\` 等基本图形定义位置和大小。
        ` : ''}
      `;
    }

    // 调用中转站 API (Stream)
    const apiUrl = `${baseUrl}/v1beta/models/${modelName}:streamGenerateContent?alt=sse`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey!
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
        const errorText = await response.text();
        try {
           const errorJson = JSON.parse(errorText);
           return NextResponse.json(errorJson, { status: response.status });
        } catch {
           throw new Error(`API request failed: ${response.status} ${errorText}`);
        }
    }

    // 创建流式响应
    const stream = new ReadableStream({
      async start(controller) {
        if (!response.body) {
          controller.close();
          return;
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed === ': keep-alive') continue;
                if (trimmed.startsWith('data: ')) {
                    const jsonStr = trimmed.substring(6);
                    if (jsonStr === '[DONE]') continue;
                    try {
                        const json = JSON.parse(jsonStr);
                        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (text) {
                            controller.enqueue(text);
                        }
                    } catch (e) {
                        console.error("Error parsing stream chunk", e);
                    }
                }
            }
          }
        } catch (e) {
             console.error("Stream reading error", e);
             controller.error(e);
        } finally {
             controller.close();
        }
      }
    });

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Transfer-Encoding': 'chunked'
        }
    });

  } catch (error: any) {
    console.error('Quiz generation error:', error);
    return NextResponse.json(
      { error: error.message || '无法生成题目，请稍后再试。' },
      { status: 500 }
    );
  }
}
