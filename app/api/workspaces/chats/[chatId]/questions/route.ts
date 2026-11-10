import z from "zod";
import { NextResponse } from "next/server";
import { handler } from "@/lib/server/http";
import { CreateQuestionSchema } from "@/zrc/lib/schemas/question";
import { questionService } from "@/service/question.service";

const RequestSchema = z.object({ question: CreateQuestionSchema });
export const POST = handler<{ chatId: string }>(async (request, { params }) => {
    const { chatId } = await params;
    const { question } = RequestSchema.parse(await request.json());
    return NextResponse.json(await questionService.create(chatId, question), { status: 201 });
});
