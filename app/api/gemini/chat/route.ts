import { NextRequest, NextResponse } from 'next/server';
import { ExamMode } from '../../../../types';
import { SYSTEM_INSTRUCTIONS, MODEL_FLASH, MODEL_PRO } from '../../../../constants';
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

    const { text, image, mode, history = [] } = await request.json();

    let modelName = MODEL_FLASH;

    switch (mode) {
      case ExamMode.SHEN_LUN:
        modelName = MODEL_PRO;
        break;
      case ExamMode.MIAN_SHI:
        modelName = MODEL_PRO;
        break;
      case ExamMode.XING_CE:
      default:
        modelName = MODEL_FLASH;
        break;
    }

    // 在用户消息前加中文提示，确保模型用中文回答
    const userMessage = `请用中文回答以下问题：\n\n${text}`;

    const parts: any[] = [{ text: userMessage }];

    if (image) {
      const base64Data = image.includes('base64,')
        ? image.split('base64,')[1]
        : image;

      parts.unshift({
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data
        }
      });
    }

    // 构建请求体
    const contents = [
      ...history.map((msg: any) => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: msg.parts
      })),
      {
        role: 'user',
        parts
      }
    ];

    const requestBody: any = {
      contents,
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTIONS[mode] }]
      }
    };

    // 调用中转站 API
    const apiUrl = `${baseUrl}/v1beta/models/${modelName}:generateContent`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey!
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || '抱歉，我无法生成回答。';

    return NextResponse.json({
      text: responseText,
      success: true
    });

  } catch (error: any) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: error.message || 'AI 服务暂时不可用，请检查网络或稍后再试。' },
      { status: 500 }
    );
  }
}
