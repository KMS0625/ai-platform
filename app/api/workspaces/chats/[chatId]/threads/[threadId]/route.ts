import { threadService } from "@/service/thread.servie";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { getMessages } from "@/service/messageService";
import { dispatcher } from "@/service/ai/dispatcherService";
import { answerService } from "@/service/answerService";

export async function  DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ chatId: string, threadId: string }>}
) {
    try {
        const { chatId, threadId } = await params;

        await threadService.delete(chatId, threadId);

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2025"
        ) {
            return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
        }

        console.error("[DELETE thread]", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}





