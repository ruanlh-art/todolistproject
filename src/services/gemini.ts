import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function validateTodoMeaning(text: string): Promise<boolean> {
  if (!text.trim()) return false;
  
  // Basic heuristic check first to save API calls for obvious junk
  if (text.length < 2) return false;
  if (/^[0-9]+$/.test(text)) return false;
  if (/^[a-zA-Z]+$/.test(text) && text.length < 3) return false;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Using a fast model for validation
      contents: `判断以下待办事项是否具有实际意义（不是乱写的数字、随机字符或无意义的单词）。
      待办事项: "${text}"
      只需回复 "true" 或 "false"。`,
      config: {
        temperature: 0,
      }
    });

    const result = response.text?.toLowerCase().trim();
    return result === "true";
  } catch (error) {
    console.error("Gemini validation error:", error);
    // Fallback to basic length check if API fails
    return text.length >= 2;
  }
}
