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
export const PageResponseSchema = z.object({
    id: z.uuid(),
    noteId: z.uuid(),
    title: z.string(),
    enabled: z.boolean(),
    keywords: z.array(z.string()),
    priority: z.number().int(),
    importance: z.number().int(),
    content: z.string(),
    order: z.number().int(),
    createdAt: z.iso.datetime({ offset: true }),
});
export type PageResponseDto = z.infer<typeof PageResponseSchema>;
export type PageListResponseDto = PageResponseDto[];
export type MatchedPageDto = Pick<PageResponseDto, "content" | "priority" | "importance">;
