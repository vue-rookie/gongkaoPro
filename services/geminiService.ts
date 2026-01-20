import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ExamMode } from '../types';
import { SYSTEM_INSTRUCTIONS, MODEL_FLASH, MODEL_PRO } from '../constants';

// Initialize the client
// Note: In a real Next.js production app, you should ideally proxy these requests 
// through a server action or API route to hide the API key. 
// For this demo, we use NEXT_PUBLIC_ to allow client-side calls.
const apiKey = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY;
if (!apiKey) {
    console.error("API Key not found. Please set NEXT_PUBLIC_API_KEY in .env.local");
}
const ai = new GoogleGenAI({ apiKey: apiKey! });

interface SendMessageParams {
  text: string;
  image?: string; // base64 string without data prefix
  mode: ExamMode;
  history?: { role: 'user' | 'model'; parts: { text: string }[] }[];
}

interface GeminiResponse {
  text: string;
}

export const sendMessageToGemini = async ({
  text,
  image,
  mode,
  history = []
}: SendMessageParams): Promise<GeminiResponse> => {
  try {
    // Configure Model & Thinking Budget based on the task type (Gemini 3 Optimization)
    let modelName = MODEL_FLASH;
    let thinkingBudget: number | undefined = undefined;

    switch (mode) {
      case ExamMode.SHEN_LUN:
        // Essay writing needs high intelligence and structure.
        modelName = MODEL_PRO; 
        thinkingBudget = 2048; // Deep thinking for outlining and policy analysis
        break;
        
      case ExamMode.MIAN_SHI:
        // Interviews need high nuance and "EQ", but also reasonable latency.
        modelName = MODEL_PRO; 
        thinkingBudget = 512; // Light thinking to organize speech points
        break;
        
      case ExamMode.XING_CE:
      default:
        // Logic puzzles/Math need reasoning but Flash is generally fast and capable enough with thinking.
        modelName = MODEL_FLASH; 
        thinkingBudget = 1024; // Moderate thinking for logic derivation
        break;
    }

    const parts: any[] = [{ text }];

    if (image) {
      // Remove data URL prefix if present (e.g., "data:image/png;base64,")
      const base64Data = image.includes('base64,') 
        ? image.split('base64,')[1] 
        : image;

      parts.unshift({
        inlineData: {
          mimeType: 'image/jpeg', // Assuming JPEG for simplicity, or detect from string
          data: base64Data
        }
      });
    }

    // Construct the chat session
    const chat = ai.chats.create({
      model: modelName,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS[mode],
        thinkingConfig: thinkingBudget ? { thinkingBudget } : undefined,
        // Removed googleSearch tool to rely on internal knowledge base
      },
      history: history 
    });

    const result: GenerateContentResponse = await chat.sendMessage({
      message: parts
    });
    
    // Extract text
    const responseText = result.text || "抱歉，我无法生成回答。";
    
    return {
      text: responseText
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("AI 服务暂时不可用，请检查网络或稍后再试。");
  }
};