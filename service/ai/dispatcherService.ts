import { getModelInfo } from "@/lib/models";
import { askGemini } from "./geminiService";
import type { ChatMessage } from "@/lib/context/buildContext";
import { PromptParams } from "@/models/Prompt";

export function dispatcher(message: ChatMessage[], model: string, params?: PromptParams): Promise<string> {
        const provider = getModelInfo(model).provider;

        switch(provider) {
        case "Gemini":
                return askGemini({message, model, config: params});
        case "OpenAI":
            return Promise.resolve("OpenAI 임시 응답입니다.");
        case "Anthropic":
            return Promise.resolve("Anthropic 임시 응답입니다.");
        default:
            return Promise.resolve("지원하지 않는 모델 응답입니다.");
    }
}