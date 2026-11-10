import z from "zod";

export const CreatePageSchema = z.object({
    title: z.string().optional(),
    enabled: z.boolean().optional(),
    keywords: z.array(z.string()).optional(),
    priority: z.number().int().optional(),
    importance: z.number().int().optional(),
    content: z.string().optional(),
});
export const UpdatePageSchema = CreatePageSchema.extend({ order: z.number().int().optional() });
export type CreatePageDto = z.infer<typeof CreatePageSchema>;
export type UpdatePageDto = z.infer<typeof UpdatePageSchema>;
export type PageResponseDto = {
    id: string;
    noteId: string;
    title: string;
    enabled: boolean;
    keywords: string[];
    priority: number;
    importance: number;
    content: string;
    order: number;
    createdAt: string;
};
export type PageListResponseDto = PageResponseDto[];
export type MatchedPageDto = Pick<PageResponseDto, "content" | "priority" | "importance">;
