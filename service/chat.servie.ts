import type { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { ThreadCreateData } from "@/models/Thread";
import { ChatCreateData } from "@/models/Workspace";

const ORDER_STEP = 10;
const DEFALUT_TITLE = "새로운 채팅";

export const chatServie = {
    createWithThread(threadData: ThreadCreateData) {
        return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const { _max } = await tx.chatWorkspace.aggregate({
                _max: { order: true }
            })

            const total = await prisma.chatWorkspace.count();

            return tx.chatWorkspace.create({
                data: {
                    title: `${DEFALUT_TITLE} ${total}`,
                    order: (_max.order ?? 0) + ORDER_STEP,
                    threads: {
                        create: {
                            title: `new thread 0`,
                            model: threadData.model,
                        }
                    }
                },
                include: { threads: true },
            })
        })
    },
    findAll() {
        return prisma.chatWorkspace.findMany({
            orderBy: { order: "desc" }
        })
    },
    delete(id: string) {
        return prisma.chatWorkspace.delete({
            where: { id }
        })
    },
    get(id: string) {
        return prisma.chatWorkspace.findUnique({
            where: { id }
        })
    },
    getContext(id: string) {
        return prisma.chatWorkspace.findUnique({
            where: { id },
            select: { noteId: true, promptId: true },
        });
    },
    setContext(
        id: string,
        data: { noteId?: string | null; promptId?: string | null }
    ) {
        return prisma.chatWorkspace.update({
            where: { id },
            data,
            select: { noteId: true, promptId: true },
        });
    },
}