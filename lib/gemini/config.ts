import { GenerateContentConfig } from "@google/genai";
import { supportsSampling } from "./model";

export function sanitizeConfig(
  model: string,
  config: GenerateContentConfig
): GenerateContentConfig {
  if (supportsSampling(model)) return config;
 
  const { temperature, topP, topK, ...rest } = config;
  if (temperature !== undefined || topP !== undefined || topK !== undefined) {
    console.warn(`[gemini] ${model}: temperature/topP/topK는 무시되어 제거했습니다.`);
  }
  
  return rest;
}
 