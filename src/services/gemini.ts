import { GoogleGenAI } from "@google/genai";

export async function validateTodoMeaning(text: string): Promise<boolean> {
  if (!text.trim()) return false;
  
  // Basic heuristic check first to save API calls for obvious junk
  if (text.length < 1) return false;
  // If it's just numbers, it's likely junk, but let's be lenient if it's more than 5 digits
  if (/^[0-9]+$/.test(text) && text.length < 5) return false;
  // If it's just one character, it's likely junk
  if (text.trim().length < 2) return false;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined, skipping AI validation");
      return text.length >= 2;
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Using a fast model for validation
      contents: `判断以下待办事项是否具有实际意义（不是乱写的数字、随机字符或无意义的单词）。
      待办事项: "${text}"
      
      注意：请尽量包容。即使是简单的词汇（如“开会”、“吃饭”、“运动”）也应视为有意义。
      只有当内容明显是乱码（如 "asdfgh"）或纯数字且无语境时才回复 "false"。
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
