import { NextResponse } from "next/server";
import { handler } from "@/lib/server/http";
import { similarityService, SimilarityServiceError } from "@/service/similarityService";
import { SimilarityRequestSchema } from "@/zrc/lib/schemas/similarity";

export const POST = handler(async request => {
    const data = SimilarityRequestSchema.parse(await request.json());
    try {
        return NextResponse.json(await similarityService.calculate(data, request.signal));
    } catch (error) {
        if (error instanceof SimilarityServiceError) {
            return NextResponse.json({ error: error.code }, { status: error.status });
        }
        throw error;
    }
});
