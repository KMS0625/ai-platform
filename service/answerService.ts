import prisma from "@/lib/prisma"
import { CreateAnswerSchema } from "@/zrc/lib/schemas/answer";
import type { AnswerResponseDto, AnswerWithQuestionContentDto, CreateAnswerDto } from "@/zrc/lib/schemas/answer";
import type { MessageHistoryResponseDto } from "@/zrc/lib/schemas/message";

export const answerService = {
    async create(questionId:string, threadId: string, data: CreateAnswerDto): Promise<AnswerResponseDto> {
        const answer = CreateAnswerSchema.parse(data);
        const created = await prisma.answer.create({
            data: {
                threadId,
                questionId,
                content: answer.content,
                status: answer.status === "failed" ? "FAILED" : "COMPLETED",
            }
        }) 
        return {
            ...created,
            createdAt: created.createdAt.toISOString(),
            updatedAt: created.updatedAt.toISOString(),
        };
    },
    findAnswersWithQuestion(threadId: string): Promise<AnswerWithQuestionContentDto[]> {
        return prisma.answer.findMany({
            where: { threadId },
            orderBy: { id: "desc" },
            select: {
                content: true,
                question: {
                    select: { content: true }
                }
            }
        })
    },
    // 가장 최신 메시지부터 가져오기
    async getMessagesByThreadId(threadId: string): Promise<MessageHistoryResponseDto> {
        const answers = await prisma.answer.findMany({
            where: {threadId},
            orderBy: { id: "desc" },
            include: {
                question: true,
            }
        })
        return answers.map(answer => ({
            ...answer,
            createdAt: answer.createdAt.toISOString(),
            updatedAt: answer.updatedAt.toISOString(),
            question: {
                ...answer.question,
                createdAt: answer.question.createdAt.toISOString(),
            },
        }));
    }
}
