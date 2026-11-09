import prisma from "@/lib/prisma";
import type { PromptUpdateData } from "@/models/Prompt";

export const promptService = {
    getAllTitle() {
    return prisma.prompt.findMany({
        orderBy: { createdAt: "desc" },
        select: {
        id: true,
        title: true,
        createdAt: true,
        },
    });
    },

    async create() {
        const total = await prisma.prompt.count();

        return prisma.prompt.create({
            data: { title: `새 프롬프트 ${total + 1}` },
        });
    },

    delete(promptId: string) {
        return prisma.prompt.delete({
            where: { id: promptId },
        });
    },

    get(promptId: string) {
        return prisma.prompt.findUnique({
            where: { id: promptId },
        });
    },

    // 값이 undefined인 필드는 Prisma가 무시하므로 보낸 필드만 수정됨
    update(promptId: string, data: PromptUpdateData) {
        return prisma.prompt.update({
            where: { id: promptId },
            data,
        });
    },
};