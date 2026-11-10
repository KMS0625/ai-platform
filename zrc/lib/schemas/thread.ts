import z from "zod";

export const CreateThreadSchema = z.object({
    title: z.string().trim().optional(),
    model: z.string().trim(),
})

export type CreateThreadDto = z.infer<typeof CreateThreadSchema>

export type ThreadResponseDto = {
    id: string;
    workspaceId: string;
    title: string;
    model: string;
    order: number;
    createdAt: string;
};

export type ThreadListResponseDto = ThreadResponseDto[];
