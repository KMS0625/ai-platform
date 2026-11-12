import { request } from "@/lib/api/client";
import { API } from "@/lib/api/route";
import { KeywordRequestSchema, KeywordResponseSchema } from "@/zrc/lib/schemas/keyword";
import type { KeywordRequestDto, KeywordResponseDto } from "@/zrc/lib/schemas/keyword";

export const keywordApi = {
    async extract(data: KeywordRequestDto, signal?: AbortSignal): Promise<KeywordResponseDto> {
        const input = KeywordRequestSchema.parse(data);
        const result = await request<KeywordResponseDto>(API.keywords, {
            method: "POST",
            json: input,
            signal,
        });
        const response = KeywordResponseSchema.parse(result);
        return { items: response.items.slice(0, input.top_k) };
    },
};
