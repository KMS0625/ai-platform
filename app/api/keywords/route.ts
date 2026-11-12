import { NextResponse } from "next/server";
import { handler } from "@/lib/server/http";
import { keywordService, KeywordServiceError } from "@/service/keywordService";
import { KeywordRequestSchema } from "@/zrc/lib/schemas/keyword";

export const POST = handler(async request => {
    const data = KeywordRequestSchema.parse(await request.json());
    try {
        return NextResponse.json(await keywordService.extract(data, request.signal));
    } catch (error) {
        if (error instanceof KeywordServiceError) {
            return NextResponse.json({ error: error.code }, { status: error.status });
        }
        throw error;
    }
});
