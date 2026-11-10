import type { PromptParamsDto } from "./prompt";

export type AiMessageDto = { role: "user" | "assistant" | "system"; content: string };
export type GenerateTextDto = {
    message: AiMessageDto[];
    model: string;
    config?: Partial<PromptParamsDto>;
};
export type GenerateContextAnswerDto = {
    chatId: string;
    threadId: string;
    question: string;
    model: string;
};
export type GenerateTextResponseDto = { content: string };
