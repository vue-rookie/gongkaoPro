import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { ExamMode } from '../../../../types';
import { SYSTEM_INSTRUCTIONS, MODEL_FLASH, MODEL_PRO } from '../../../../constants';
import { getUserFromRequest } from '@/lib/auth';
import { checkAndDeductUsage } from '@/lib/checkUsageLimit';

const apiKey = process.env.GEMINI_API_KEY;
console.log('GEMINI_API_KEY:', apiKey);
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

    const ai = new GoogleGenAI({ apiKey });

    let modelName = MODEL_FLASH;
    let thinkingBudget: number | undefined = undefined;

    switch (mode) {
      case ExamMode.SHEN_LUN:
        modelName = MODEL_PRO;
        thinkingBudget = 2048;
        break;
      case ExamMode.MIAN_SHI:
        modelName = MODEL_PRO;
        thinkingBudget = 512;
        break;
      case ExamMode.XING_CE:
      default:
        modelName = MODEL_FLASH;
        thinkingBudget = 1024;
        break;
    }

    const parts: any[] = [{ text }];

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

    const chat = ai.chats.create({
      model: modelName,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS[mode],
        thinkingConfig: thinkingBudget ? { thinkingBudget } : undefined,
      },
      history: history
    });

    const result: GenerateContentResponse = await chat.sendMessage({
      message: parts
    });

    const responseText = result.text || '抱歉，我无法生成回答。';

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
