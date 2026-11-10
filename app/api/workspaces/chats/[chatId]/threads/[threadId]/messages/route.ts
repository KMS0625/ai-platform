import { NextResponse } from "next/server";
import { handler } from "@/lib/server/http";
import { answerService } from "@/service/answerService";

export const GET = handler<{ chatId: string; threadId: string }>(async (_request, { params }) => {
    const { threadId } = await params;
    return NextResponse.json(await answerService.getMessagesByThreadId(threadId));
});
