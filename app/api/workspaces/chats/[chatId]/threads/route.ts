import { ThreadCreateData } from "@/models/Thread";
import { threadService } from "@/service/thread.servie";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ chatId: string }> }
) {
    try {
        const { chatId } = await params;

        const threadSet = await threadService.getByWorkspaceId(chatId);

        if (!threadSet) {
            return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
        }

        return NextResponse.json(threadSet);
    } catch (error) {
        console.error("[GET thread]", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ chatId: string }> }
) {
    try {
        const { chatId } = await params;

        const body: {
            thread?: ThreadCreateData;
        } = await request.json();

        const { thread } = body;

        if (!thread?.model) {
            return NextResponse.json(
                { error: "thread.model are required. "},
                { status: 400 }
            )
        }

        console.log("thread", thread?.model);

        // if (!(thread.model in MODELS)) {
        //     return NextResponse.json(
        //         { error: "Unsurpported model." },
        //         { status: 400 }
        //     )
        // }

        const create = await threadService.create(chatId, thread);

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