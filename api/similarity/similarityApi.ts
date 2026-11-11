import { request } from "@/lib/api/client";
import { API } from "@/lib/api/route";
import { SimilarityRequestSchema, SimilarityResponseSchema } from "@/zrc/lib/schemas/similarity";
import type { SimilarityRequestDto, SimilarityResponseDto } from "@/zrc/lib/schemas/similarity";

export const similarityApi = {
    async calculate(data: SimilarityRequestDto, signal?: AbortSignal): Promise<SimilarityResponseDto> {
        const input = SimilarityRequestSchema.parse(data);
        if (input.noteId === null) return { items: [] };
        const result = await request<SimilarityResponseDto>(API.similarity, {
            method: "POST",
            json: input,
            signal,
        });
        return SimilarityResponseSchema.parse(result);
    },
};
