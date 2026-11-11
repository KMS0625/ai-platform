import "server-only";
import { SimilarityRequestSchema, SimilarityResponseSchema } from "@/zrc/lib/schemas/similarity";
import type { SimilarityRequestDto, SimilarityResponseDto } from "@/zrc/lib/schemas/similarity";

export class SimilarityServiceError extends Error {
    constructor(public readonly status: 502 | 503 | 504, public readonly code: string) {
        super(code);
        this.name = "SimilarityServiceError";
    }
}

const REQUEST_TIMEOUT_MS = 30_000;

export const similarityService = {
    async calculate(data: SimilarityRequestDto, signal?: AbortSignal): Promise<SimilarityResponseDto> {
        const input = SimilarityRequestSchema.parse(data);
        if (input.noteId === null) return { items: [] };

        const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
        const requestSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
        let response: Response;
        let body: unknown;
        try {
            response = await fetch(
                process.env.SIMILARITY_API_URL ?? "http://127.0.0.1:8000/similarity",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(input),
                    cache: "no-store",
                    signal: requestSignal,
                },
            );
            if (!response.ok) throw new SimilarityServiceError(502, "SIMILARITY_UPSTREAM_ERROR");
            // Keep the timeout active while reading the response body too.
            body = await response.json();
        } catch (error) {
            if (signal?.aborted) throw error;
            if (error instanceof SimilarityServiceError) throw error;
            if (timeout.aborted) throw new SimilarityServiceError(504, "SIMILARITY_TIMEOUT");
            if (error instanceof SyntaxError) throw new SimilarityServiceError(502, "INVALID_SIMILARITY_RESPONSE");
            throw new SimilarityServiceError(503, "SIMILARITY_UNAVAILABLE");
        }

        const parsed = SimilarityResponseSchema.safeParse(body);
        if (!parsed.success || parsed.data.items.some(item => item.page.noteId !== input.noteId)
            || new Set(parsed.data.items.map(item => item.page.id)).size !== parsed.data.items.length) {
            throw new SimilarityServiceError(502, "INVALID_SIMILARITY_RESPONSE");
        }
        return parsed.data;
    },
};
