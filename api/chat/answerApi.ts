import { API } from "@/lib/api/route";
import { request } from "@/lib/api/client";
import { toAnswer } from "@/api/mapper";
import type { Answer } from "@/models/Answer";
import type { AnswerResponseDto, GenerateAnswerDto } from "@/zrc/lib/schemas/answer";

export const AnswerApi = {
    async getAnswer(chatId: string, threadId: string, questionId: string, model: string, question: string, signal?: AbortSignal): Promise<Answer> {
        const data = await request<AnswerResponseDto>(API.chat.answer(chatId, threadId, questionId), {
            method: "POST",
            json: { model, question } satisfies GenerateAnswerDto,
            signal,
        });
        return toAnswer(data);
    },
};
