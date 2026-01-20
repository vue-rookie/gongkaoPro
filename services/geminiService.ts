import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ExamMode, QuizQuestion } from '../types';
import { SYSTEM_INSTRUCTIONS, MODEL_FLASH, MODEL_PRO } from '../constants';

const apiKey = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY;
if (!apiKey) {
    console.error("API Key not found. Please set NEXT_PUBLIC_API_KEY in .env.local");
}
const ai = new GoogleGenAI({ apiKey: apiKey! });

interface SendMessageParams {
  text: string;
  image?: string;
  mode: ExamMode;
  history?: { role: 'user' | 'model'; parts: { text: string }[] }[];
}

interface GeminiResponse {
  text: string;
  quizData?: QuizQuestion[];
}

export const sendMessageToGemini = async ({
  text,
  image,
  mode,
  history = []
}: SendMessageParams): Promise<GeminiResponse> => {
  try {
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
    
    const responseText = result.text || "抱歉，我无法生成回答。";
    
    return {
      text: responseText
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("AI 服务暂时不可用，请检查网络或稍后再试。");
  }
};

export const generateQuiz = async (mode: ExamMode, topic?: string, count: number = 5): Promise<QuizQuestion[]> => {
  try {
    const modelName = MODEL_FLASH; 
    let prompt = "";

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
             - **严禁**使用文字描述（如“A. 一个黑点”）作为选项，必须画出来。
             - 保持 SVG 简洁，viewBox 建议 "0 0 100 100"。
          ` : ''}
        `;
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
      }
    });

    const jsonText = response.text || "[]";
    const cleanJson = jsonText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```$/, '').trim();
    
    const quizData = JSON.parse(cleanJson);
    
    return quizData.map((q: any, index: number) => ({
      ...q,
      id: q.id || `quiz-${Date.now()}-${index}`
    }));

  } catch (error) {
    console.error("Quiz Generation Error:", error);
    throw new Error("无法生成题目，请稍后再试。");
  }
};