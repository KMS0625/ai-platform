import { ChatMessage } from "@/lib/context/buildContext";
import { AnswerCreateData } from "@/models/Answer";
import { contextService } from "@/service/ai/contextService";
import { dispatcher } from "@/service/ai/dispatcherService";
import { answerService } from "@/service/answerService";
import { chatServie } from "@/service/chat.servie";
import { getMessages } from "@/service/messageService";
import { pageService } from "@/service/pageService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ chatId: string; threadId: string; questionId: string }> },
) {
    try {
        const { chatId, threadId, questionId } = await params;

        const body = await request.json().catch(() => null);
        const model = body?.model;
        const question = body?.question;

        if (typeof model !== "string" || typeof question !== "string") {
            return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
        }

        const answer = await contextService(chatId, threadId, question, model);        

        const data: AnswerCreateData = {
            content: answer,
            status: "completed",
        }
        const response = await answerService.create(questionId, threadId, data);

        console.log("답변 저장 성공", response);

        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("[POST answer]", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}