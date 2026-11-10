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
    // 가장 최신 메시지부터 가져오기
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