import prisma from "@/lib/prisma"
import { AnswerCreateData } from "@/models/Answer"

export const answerService = {
    create(questionId:string, threadId: string, answer: AnswerCreateData) {
        return prisma.answer.create({
            data: {
                threadId,
                questionId,
                content: answer.content,
            }
        }) 
    },
    findAnswersWithQuestion(threadId: string) {
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
    getMessagesByThreadId(threadId: string) {
        return prisma.answer.findMany({
            where: {threadId},
            orderBy: { id: "desc" },
            include: {
                question: true,
            }
        })
    }
}