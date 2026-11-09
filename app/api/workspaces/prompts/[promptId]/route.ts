import { NextRequest, NextResponse } from "next/server";
import type { PromptUpdateData } from "@/models/Prompt";
import { promptService } from "@/service/promptServie";
import { Prisma } from "@/generated/prisma/client";

type Context = { params: Promise<{ promptId: string }> };

export async function GET(_req: NextRequest, { params }: Context) {
    const { promptId } = await params;

    try {
        const prompt = await promptService.get(promptId);
        
        if (!prompt) {
            return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
        }

        return NextResponse.json(prompt);
    } catch (error) {
        console.error("[GET prompt]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: Context) {
    const { promptId } = await params;

    let body: PromptUpdateData;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
    }

    // 허용된 필드만 통과 (id, createdAt 등 변조 방지)
    const {
        title,
        description,
        content,
        temperature,
        topP,
        maxInputTokens,
        maxOutputTokens,
        frequencyPenalty,
        presencePenalty,
    } = body;

    try {
        const prompt = await promptService.update(promptId, {
            title,
            description,
            content,
            temperature,
            topP,
            maxInputTokens,
            maxOutputTokens,
            frequencyPenalty,
            presencePenalty,
        });
        return NextResponse.json(prompt);
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2025"
        ) {
            return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
        }
        console.error("[PUT prompt]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: Context) {
    const { promptId } = await params;

    try {
        await promptService.delete(promptId);
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2025"
        ) {
            return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
        }
        console.error("[DELETE prompt]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}