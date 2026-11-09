import { ThreadCreateData } from "@/models/Thread";
import { ChatCreateData } from "@/models/Workspace";
import { chatServie } from "@/service/chat.servie";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
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

        const create = await chatServie.createWithThread(thread);

        return NextResponse.json(create, { status: 201 })
    } catch (error) {
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { error: "Invaild request format." },
                { status: 400 }
            )
        }

        console.error("[POST chatWorkspace]", error);
        return NextResponse.json(
            { error: "Intel Server Error" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const workspace = await chatServie.findAll();
        return NextResponse.json(workspace);
    } catch (error) {
        console.error("[GET chatWorkspace]", error);
        return NextResponse.json(
            { error: "Intel Server Error" },
            { status: 500 }
        );
    }
}