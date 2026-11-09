import type { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { ThreadCreateData } from "@/models/Thread";
import { create } from "domain";

const ORDER_STEP = 10;
const DEFALUT_TITLE = "new thread";

export const threadService = {
    create(workspaceId: string, threadData: ThreadCreateData) {
        return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const { _max } = await tx.thread.aggregate({
                _max: { order: true }
            })

            const total = await prisma.thread.count();

            return tx.thread.create({
                data: {
                    title: `${DEFALUT_TITLE} ${total}`,
                    workspaceId,
                    model: threadData.model,
                    order: (_max.order ?? 0) + ORDER_STEP,
                }
            })
        })
    },
    delete(workspaceId: string, threadId: string) {
        return prisma.thread.delete({
            where: { 
                id: threadId,
                workspaceId,
            }
        })
    },

    getByWorkspaceId(workspaceId: string) {
        return prisma.thread.findMany({
            where: { workspaceId },
            orderBy: { order: "asc" }
        })
    } 
}