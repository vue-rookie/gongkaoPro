import { ExamMode, QuizQuestion } from '../types';
import { getApiPath } from '../config/api';

interface SendMessageParams {
  text: string;
  image?: string;
  mode: ExamMode;
  history?: { role: 'user' | 'model'; parts: { text: string }[] }[];
  token?: string;
  onStream?: (text: string) => void;
}

interface GeminiResponse {
  text: string;
  quizData?: QuizQuestion[];
  needUpgrade?: boolean;
  needLogin?: boolean;
  remaining?: number;
}

export const sendMessageToGemini = async ({
  text,
  image,
  mode,
  history = [],
  token,
  onStream
}: SendMessageParams): Promise<GeminiResponse> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(getApiPath('/api/gemini/chat'), {
      method: 'POST',
      headers,
      body: JSON.stringify({
        text,
        image,
        mode,
        history
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 401) {
        return {
          text: errorData.error || '请先登录',
          needLogin: true
        };
      }
      if (response.status === 403) {
        return {
          text: errorData.error || '免费次数已用完',
          needUpgrade: true,
          remaining: errorData.remaining
        };
      }
      throw new Error(errorData.error || 'AI 服务暂时不可用');
    }

    // Stream Handling
    if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            fullText += chunk;
            if (onStream) {
                onStream(chunk);
            }
        }
        return { text: fullText };
    } else {
        // Fallback (unlikely with current backend)
        const text = await response.text();
        return { text };
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("AI 服务暂时不可用，请检查网络或稍后再试。");
  }
};

export const generateQuiz = async (mode: ExamMode, topic?: string, count: number = 5, token?: string): Promise<QuizQuestion[]> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(getApiPath('/api/gemini/quiz'), {
      method: 'POST',
      headers,
      body: JSON.stringify({
        mode,
        topic,
        count
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 401) {
        throw new Error('NEED_LOGIN');
      }
      if (errorData.needUpgrade) {
        throw new Error(errorData.error || '免费次数已用完，请开通会员');
      }
      throw new Error(errorData.error || '无法生成题目');
    }

    // Read the stream
    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");
    
    const decoder = new TextDecoder();
    let jsonText = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        jsonText += decoder.decode(value, { stream: true });
    }

    // Clean and Parse JSON
    const cleanJson = jsonText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```$/, '').trim();
    let quizData: QuizQuestion[] = [];
    
    try {
        quizData = JSON.parse(cleanJson);
    } catch (e) {
        console.error("JSON Parse Error:", e);
        console.log("Received Text:", jsonText);
        throw new Error("题目生成格式错误，请重试");
    }

    // Post-processing (Add IDs if missing)
    const processedData = quizData.map((q: any, index: number) => ({
      ...q,
      id: q.id || `quiz-${Date.now()}-${index}`
    }));

    return processedData;

  } catch (error) {
    console.error("Quiz Generation Error:", error);
    throw error;
  }
};