import "server-only";
import { KeywordRequestSchema, KeywordResponseSchema } from "@/zrc/lib/schemas/keyword";
import type { KeywordRequestDto, KeywordResponseDto } from "@/zrc/lib/schemas/keyword";

export class KeywordServiceError extends Error {
    constructor(public readonly status: 502 | 503 | 504, public readonly code: string) {
        super(code);
        this.name = "KeywordServiceError";
    }
}

const REQUEST_TIMEOUT_MS = 30_000;

export const keywordService = {
    async extract(data: KeywordRequestDto, signal?: AbortSignal): Promise<KeywordResponseDto> {
        const input = KeywordRequestSchema.parse(data);

        const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
        const requestSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
        let response: Response;
        let body: unknown;
        try {
            response = await fetch(
                process.env.KEYWORD_API_URL ?? "http://127.0.0.1:8000/keywords",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(input),
                    cache: "no-store",
                    signal: requestSignal,
                },
            );
            if (!response.ok) throw new KeywordServiceError(502, "KEYWORD_UPSTREAM_ERROR");
            // Keep the timeout active while reading the response body too.
            body = await response.json();
        } catch (error) {
            if (signal?.aborted) throw error;
            if (error instanceof KeywordServiceError) throw error;
            if (timeout.aborted) throw new KeywordServiceError(504, "KEYWORD_TIMEOUT");
            if (error instanceof SyntaxError) throw new KeywordServiceError(502, "INVALID_KEYWORD_RESPONSE");
            throw new KeywordServiceError(503, "KEYWORD_UNAVAILABLE");
        }

        const parsed = KeywordResponseSchema.safeParse(body);
        if (!parsed.success) {
            throw new KeywordServiceError(502, "INVALID_KEYWORD_RESPONSE");
        }
        return { items: parsed.data.items.slice(0, input.top_k) };
    },
};
