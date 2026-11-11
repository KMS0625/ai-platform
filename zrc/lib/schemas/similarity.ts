import z from "zod";
import { PageResponseSchema } from "./page";

export const SimilarityRequestSchema = z.object({
    source: z.string(),
    noteId: z.uuid().nullable(),
});

export const PageSimilaritySchema = z.object({
    page: PageResponseSchema,
    // Cosine similarity × 100, not a probability; negative scores are valid.
    score: z.number().min(-100).max(100),
});

export const SimilarityResponseSchema = z.object({ items: z.array(PageSimilaritySchema) });

export type SimilarityRequestDto = z.infer<typeof SimilarityRequestSchema>;
export type SimilarityResponseDto = z.infer<typeof SimilarityResponseSchema>;
export type PageSimilarityDto = z.infer<typeof PageSimilaritySchema>;
