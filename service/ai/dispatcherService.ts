import { getModelInfo } from "@/lib/models";
import { askGemini } from "./geminiService";
import type { GenerateTextDto, GenerateTextResponseDto } from "@/zrc/lib/schemas/ai";

export function dispatcher({ message, model, config }: GenerateTextDto): Promise<GenerateTextResponseDto> {
        const provider = getModelInfo(model).provider;

        switch(provider) {
        case "Gemini":
                return askGemini({ message, model, config });
        case "OpenAI":
            return Promise.resolve({ content: "OpenAI 임시 응답입니다." });
        case "Anthropic":
            return Promise.resolve({ content: "Anthropic 임시 응답입니다." });
        default:
            return Promise.resolve({ content: "지원하지 않는 모델 응답입니다." });
    }
}
