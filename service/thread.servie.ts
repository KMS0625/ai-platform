import type { Thread } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { CreateThreadSchema } from "@/zrc/lib/schemas/thread";
import type { CreateThreadDto, ThreadListResponseDto, ThreadResponseDto } from "@/zrc/lib/schemas/thread";

const ORDER_STEP = 10;
const DEFAULT_TITLE = "new thread";

function toThreadResponseDto(thread: Thread): ThreadResponseDto {
    return {
        id: thread.id,
        workspaceId: thread.workspaceId,
        title: thread.title,
        model: thread.model,
        order: thread.order,
        createdAt: thread.createdAt.toISOString(),
    };
}

export const threadService = {
    async create(workspaceId: string, data: CreateThreadDto): Promise<ThreadResponseDto> {
        const threadData = CreateThreadSchema.parse(data);
        const thread = await prisma.$transaction(async (tx) => {
            const { _max } = await tx.thread.aggregate({
                where: { workspaceId },
                _max: { order: true }
            })

            const total = await tx.thread.count({ where: { workspaceId } });

            return tx.thread.create({
                data: {
                    title: threadData.title ?? `${DEFAULT_TITLE} ${total}`,
                    workspaceId,
                    model: threadData.model,
                    order: (_max.order ?? 0) + ORDER_STEP,
                }
            })
        })
        return toThreadResponseDto(thread);
    },
    async delete(workspaceId: string, threadId: string): Promise<ThreadResponseDto> {
        const thread = await prisma.thread.delete({
            where: { 
                id: threadId,
                workspaceId,
            }
        })
        return toThreadResponseDto(thread);
    },

    async getByWorkspaceId(workspaceId: string): Promise<ThreadListResponseDto> {
        const threads = await prisma.thread.findMany({
            where: { workspaceId },
            orderBy: { order: "asc" }
        })
        return threads.map(toThreadResponseDto);
    } 
}
