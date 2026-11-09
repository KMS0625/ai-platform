import type { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { ThreadCreateData } from "@/models/Thread";
import { ChatCreateData } from "@/models/Workspace";

const ORDER_STEP = 10;
const DEFALUT_TITLE = "새로운 노트";

export const noteService = {
    createWithPage() {
        return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const { _max } = await tx.note.aggregate({
                _max: { order: true }
            })

            const total = await prisma.note.count();

            return tx.note.create({
                data: {
                    title: `${DEFALUT_TITLE} ${total}`,
                    order: (_max.order ?? 0) + ORDER_STEP,
                    pages: {
                        create: {
                            title: `new page 0`,
                        }
                    }
                },
                include: { pages: true },
            })
        })
    },
    findAll() {
        return prisma.note.findMany({
            orderBy: { order: "desc" }
        })
    },
    delete(id: string) {
        return prisma.note.delete({
            where: { id }
        })
    }
}