import { GoogleGenAI } from "@google/genai";
 
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set");
}
 
// 앱 전체에서 하나만 만들어서 재사용
export const ai = new GoogleGenAI({ apiKey });
 