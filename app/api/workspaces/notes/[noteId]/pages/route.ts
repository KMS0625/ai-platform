import { Prisma } from "@/generated/prisma/client";
import { ThreadCreateData } from "@/models/Thread";
import { noteService } from "@/service/noteSercive";
import { pageService } from "@/service/pageService";
import { threadService } from "@/service/thread.servie";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ noteId: string }> }
) {
    try {
        const { noteId } = await params;

        const pages = await pageService.getByWorkspaceId(noteId);

        if (!pages) {
            return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
        }

        return NextResponse.json(pages);
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
    { params }: { params: Promise<{ noteId: string }> }
) {
    try {
        const { noteId } = await params;

        const create = await pageService.create(noteId);

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

