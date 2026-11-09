import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { chatServie } from "@/service/chat.servie";

type Context = { params: Promise<{ chatId: string }> };

export async function GET(_req: NextRequest, { params }: Context) {
    const { chatId } = await params;

    try {
        const context = await chatServie.getContext(chatId);

        if (!context) {
            return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
        }

        return NextResponse.json(context);
    } catch (error) {
        console.error("[GET chat context]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


export async function PUT(req: NextRequest, { params }: Context) {
    const { chatId } = await params;

    let body: { noteId?: string | null; promptId?: string | null };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
    }

    // 허용된 필드만 통과
    const { noteId, promptId } = body;
    console.log("직혀랑", noteId, promptId);

    try {
        const updated = await chatServie.setContext(chatId, {
            noteId,
            promptId,
        });
        return NextResponse.json(updated);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
            }
            // 존재하지 않는 noteId/promptId
            if (error.code === "P2003") {
                return NextResponse.json({ error: "INVALID_REFERENCE" }, { status: 400 });
            }
        }
        console.error("[PUT chat context]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}