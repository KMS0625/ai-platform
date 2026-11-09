import type { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { QuestionCreateData } from "@/models/Question";

export const questionService = {
    create(workspaceId: string, questionData: QuestionCreateData) {
        return prisma.question.create({
            data: {
                workspaceId: workspaceId,
                content: questionData.content,
            }
        })
    },
}