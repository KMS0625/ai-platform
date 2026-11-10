import prisma from "@/lib/prisma";
import { CreateQuestionSchema } from "@/zrc/lib/schemas/question";
import type { CreateQuestionDto, QuestionResponseDto } from "@/zrc/lib/schemas/question";

export const questionService = {
    async create(workspaceId: string, data: CreateQuestionDto): Promise<QuestionResponseDto> {
        const questionData = CreateQuestionSchema.parse(data);
        const question = await prisma.question.create({
            data: {
                workspaceId: workspaceId,
                content: questionData.content,
            }
        })
        return { ...question, createdAt: question.createdAt.toISOString() };
    },
}
