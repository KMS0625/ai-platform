import { NextResponse } from "next/server";
import { handler } from "@/lib/server/http";
import { GenerateAnswerSchema } from "@/zrc/lib/schemas/answer";
import { contextService } from "@/service/ai/contextService";
import { answerService } from "@/service/answerService";

export const POST = handler<{ chatId: string; threadId: string; questionId: string }>(async (request, { params }) => {
    const { chatId, threadId, questionId } = await params;
    const { model, question } = GenerateAnswerSchema.parse(await request.json());
    const answer = await contextService({ chatId, threadId, question, model });
    const response = await answerService.create(questionId, threadId, { content: answer.content, status: "completed" });
    return NextResponse.json(response);
});
