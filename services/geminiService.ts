
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

export const solveComplexMath = async (query: string): Promise<string> => {
  if (!API_KEY) return "API Key missing. Please check your environment.";

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Calculate this: "${query}". Provide only the final numerical result or a concise answer. If it's a word problem, explain briefly but keep the result prominent.`,
      config: {
        temperature: 0.1,
        topP: 0.1,
        maxOutputTokens: 150,
      }
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error calculating result. Please try a simpler expression.";
  }
};
