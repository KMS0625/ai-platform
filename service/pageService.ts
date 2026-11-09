import type { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { PageUpdateData } from "@/models/Page";
import { ThreadCreateData } from "@/models/Thread";
import { create } from "domain";

const ORDER_STEP = 10;
const DEFALUT_TITLE = "new page";

export const pageService = {
    create(noteId: string) {
        return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const { _max } = await tx.page.aggregate({
                _max: { order: true }
            })

            const total = await prisma.page.count({
                where: {
                    noteId,
                }
            });

            return tx.page.create({
                data: {
                    title: `${DEFALUT_TITLE} ${total}`,
                    noteId,
                    order: (_max.order ?? 0) + ORDER_STEP,
                }
            })
        })
    },
    delete(noteId: string, pageId: string) {
        return prisma.page.delete({
            where: { 
                id: pageId,
                noteId,
            }
        })
    },

    getByWorkspaceId(noteId: string) {
        return prisma.page.findMany({
            where: { noteId },
            orderBy: { order: "asc" }
        })
    },
    update(noteId: string, pageId: string, data: PageUpdateData) {
        return prisma.page.update({
                where: { id: pageId, noteId },
                data,
            });
    }, findMatchedPages(noteId: string, question: string) {
        return prisma.$queryRaw<
        { content: string; priority: number; importance: number; }[]
        >`
            SELECT "content", "priority", "importance"
            FROM "Page"
            WHERE "noteId" = ${noteId}
                AND "enabled" = true
                AND EXISTS (
                    SELECT 1
                    FROM unnest("keywords") As k
                    WHERE k <> ''
                        AND position(lower(k) in lower(${question})) > 0
                    )
                ORDER BY "importance" DESC, "priority" DESC
        `
    }
}
