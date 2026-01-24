import { ExamMode, QuizQuestion } from '../types';
import { getApiPath } from '../config/api';

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
    const response = await fetch(getApiPath('/api/gemini/chat'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        image,
        mode,
        history
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'AI 服务暂时不可用');
    }

    const data = await response.json();
    return {
      text: data.text
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("AI 服务暂时不可用，请检查网络或稍后再试。");
  }
};

export const generateQuiz = async (mode: ExamMode, topic?: string, count: number = 5): Promise<QuizQuestion[]> => {
  try {
    const response = await fetch(getApiPath('/api/gemini/quiz'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode,
        topic,
        count
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '无法生成题目');
    }

    const data = await response.json();
    return data.quizData;

  } catch (error) {
    console.error("Quiz Generation Error:", error);
    throw new Error("无法生成题目，请稍后再试。");
  }
};