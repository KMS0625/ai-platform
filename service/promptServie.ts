import prisma from "@/lib/prisma";
import { CreatePromptSchema, UpdatePromptSchema } from "@/zrc/lib/schemas/prompt";
import type { CreatePromptDto, UpdatePromptDto, PromptResponseDto, PromptListResponseDto } from "@/zrc/lib/schemas/prompt";
import { toPromptDto } from "./dtoMappers";

export const promptService = {
    async getAllTitle(): Promise<PromptListResponseDto> {
    const prompts = await prisma.prompt.findMany({
        orderBy: { createdAt: "desc" },
        select: {
        id: true,
        title: true,
        createdAt: true,
        },
    });
    return prompts.map(prompt => ({ ...prompt, createdAt: prompt.createdAt.toISOString() }));
    },

    async create(data: CreatePromptDto = {}): Promise<PromptResponseDto> {
        const input = CreatePromptSchema.parse(data);
        const total = await prisma.prompt.count();

        const prompt = await prisma.prompt.create({
            data: { ...input, title: input.title ?? `새 프롬프트 ${total + 1}` },
        });
        return toPromptDto(prompt);
    },

    async delete(promptId: string): Promise<PromptResponseDto> {
        const prompt = await prisma.prompt.delete({
            where: { id: promptId },
        });
        return toPromptDto(prompt);
    },

    async get(promptId: string): Promise<PromptResponseDto | null> {
        const prompt = await prisma.prompt.findUnique({
            where: { id: promptId },
        });
        return prompt ? toPromptDto(prompt) : null;
    },

    // 값이 undefined인 필드는 Prisma가 무시하므로 보낸 필드만 수정됨
    async update(promptId: string, data: UpdatePromptDto): Promise<PromptResponseDto> {
        const prompt = await prisma.prompt.update({
            where: { id: promptId },
            data: UpdatePromptSchema.parse(data),
        });
        return toPromptDto(prompt);
    },
};
