import z from "zod";

export const KeywordRequestSchema = z.object({
    source: z.string().max(20000),
    top_k: z.number().int().min(1).max(100).default(5),
});

export const KeywordScoreSchema = z.object({
    keyword: z.string(),
    textrank: z.number().min(0).max(1),
    semantic: z.number().min(0).max(1),
    score: z.number().min(0).max(1),
});

export const KeywordResponseSchema = z.object({ items: z.array(KeywordScoreSchema) });
export type KeywordRequestDto = z.input<typeof KeywordRequestSchema>;
export type KeywordResponseDto = z.infer<typeof KeywordResponseSchema>;
