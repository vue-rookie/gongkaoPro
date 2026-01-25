import { NextRequest, NextResponse } from 'next/server';
import { ExamMode } from '../../../../types';
import { MODEL_FLASH } from '../../../../constants';
import { getUserFromRequest } from '@/lib/auth';
import { checkAndDeductUsage } from '@/lib/checkUsageLimit';

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

    const { mode, topic, count = 5 } = await request.json();

    const modelName = MODEL_FLASH;
    let prompt = '';

    if (mode === ExamMode.SHEN_LUN) {
      prompt = `
        请生成 1 道【申论 (Essay Writing)】模拟题。
        主题：${topic || '社会热点'}。

        要求：
        1. 返回纯 JSON 数组格式，只包含 1 个对象。
        2. JSON 字段包含：id, material (给定资料 300字+), question, answer (参考范文), analysis (解析), options: null。
      `;
    } else {
      const isGraphicReasoning = topic?.includes('图形推理');

      prompt = `
        请生成 ${count} 道 ${mode === ExamMode.MIAN_SHI ? '面试' : '行测'} 题目。
        主题：${topic || '随机'}。

        要求：
        1. 返回纯 JSON 数组。
        2. 包含字段：id, question, options (数组), answer, analysis。
        ${isGraphicReasoning ? `
        3. **图形推理强制要求**：
           - **题干**：描述规律后，必须用 \`\`\`svg ... \`\`\` 包裹 SVG 代码。
           - **选项**：\`options\` 数组中的每一项**必须是 SVG 代码字符串**。
           - **选项格式**：例如 ["A. <svg>...</svg>", "B. <svg>...</svg>", "C. <svg>...</svg>", "D. <svg>...</svg>"]。
           - **严禁**使用文字描述（如"A. 一个黑点"）作为选项，必须画出来。
           - 保持 SVG 简洁，viewBox 建议 "0 0 100 100"。
        ` : ''}
      `;
    }

    // 调用中转站 API
    const apiUrl = `${baseUrl}/v1beta/models/${modelName}:generateContent`;
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
      console.error('API Error:', errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    const cleanJson = jsonText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```$/, '').trim();

    const quizData = JSON.parse(cleanJson);

    const processedData = quizData.map((q: any, index: number) => ({
      ...q,
      id: q.id || `quiz-${Date.now()}-${index}`
    }));

    return NextResponse.json({
      quizData: processedData,
      success: true
    });

  } catch (error: any) {
    console.error('Quiz generation error:', error);
    return NextResponse.json(
      { error: error.message || '无法生成题目，请稍后再试。' },
      { status: 500 }
    );
  }
}
