import { QuestionCreateData } from "@/models/Question";
import { questionService } from "@/service/question.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ chatId: string }> }
) {
    try {
        const { chatId } = await params;

        const body: {
            question?: QuestionCreateData;
        } = await request.json();

        const { question } = body;

        if (!question?.content) {
            return NextResponse.json(
                { error: "question.content are required. "},
                { status: 400 }
            )
        }

        const create = await questionService.create(chatId, question);

        return NextResponse.json(create, { status: 201 })
    } catch (error) {
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { error: "Invaild request format." },
                { status: 400 }
            )
        }

        console.error("[POST thread]", error);
        return NextResponse.json(
            { error: "Intel Server Error" },
            { status: 500 }
        );
    }
}