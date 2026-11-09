import { answerService } from "@/service/answerService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ chatId: string, threadId: string}> }
) {
    try {
        const { threadId } = await params;

        const histories = await answerService.getMessagesByThreadId(threadId);

        if (!histories) {
            return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
        }

        return NextResponse.json(histories);
    } catch (error) {
        console.error("[GET history]", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}