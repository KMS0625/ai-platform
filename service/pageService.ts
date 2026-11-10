import prisma from "@/lib/prisma";
import { CreatePageSchema, UpdatePageSchema } from "@/zrc/lib/schemas/page";
import type { CreatePageDto, UpdatePageDto, PageResponseDto, PageListResponseDto, MatchedPageDto } from "@/zrc/lib/schemas/page";
import { toPageDto } from "./dtoMappers";

const ORDER_STEP = 10;
const DEFALUT_TITLE = "new page";

export const pageService = {
    async create(noteId: string, data: CreatePageDto = {}): Promise<PageResponseDto> {
        const input = CreatePageSchema.parse(data);
        const page = await prisma.$transaction(async (tx) => {
            const { _max } = await tx.page.aggregate({
                _max: { order: true }
            })

            const total = await tx.page.count({
                where: {
                    noteId,
                }
            });

            return tx.page.create({
                data: {
                    ...input,
                    title: input.title ?? `${DEFALUT_TITLE} ${total}`,
                    noteId,
                    order: (_max.order ?? 0) + ORDER_STEP,
                }
            })
        })
        return toPageDto(page);
    },
    async delete(noteId: string, pageId: string): Promise<PageResponseDto> {
        const page = await prisma.page.delete({
            where: { 
                id: pageId,
                noteId,
            }
        })
        return toPageDto(page);
    },

    async getByWorkspaceId(noteId: string): Promise<PageListResponseDto> {
        const pages = await prisma.page.findMany({
            where: { noteId },
            orderBy: { order: "asc" }
        })
        return pages.map(toPageDto);
    },
    async update(noteId: string, pageId: string, data: UpdatePageDto): Promise<PageResponseDto> {
        const page = await prisma.page.update({
                where: { id: pageId, noteId },
                data: UpdatePageSchema.parse(data),
            });
        return toPageDto(page);
    }, findMatchedPages(noteId: string, question: string): Promise<MatchedPageDto[]> {
        return prisma.$queryRaw<
        MatchedPageDto[]
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
