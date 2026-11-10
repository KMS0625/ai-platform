import { API } from "@/lib/api/route";
import { request } from "@/lib/api/client";
import { toQuestion } from "@/api/mapper";
import type { Question } from "@/models/Question";
import type { CreateQuestionDto, QuestionResponseDto } from "@/zrc/lib/schemas/question";

export const questionApi = {
    async create(chatId: string, question: CreateQuestionDto): Promise<Question> {
        const data = await request<QuestionResponseDto>(API.chat.questions(chatId), { method: "POST", json: { question } });
        return toQuestion(data);
    },
};
