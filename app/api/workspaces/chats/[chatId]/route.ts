import WorkspaceNav from "@/components/workspaveNav/WorkspaceNav";
import { Prisma } from "@/generated/prisma/client";
import { chatServie } from "@/service/chat.servie";
import { NextRequest, NextResponse } from "next/server";

export async function  DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ chatId: string }>}
) {
    try {
        const { chatId } = await params;

        await chatServie.delete(chatId);

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2025"
        ) {
            return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
        }

        console.error("[DELETE chatWorkspace]", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function  GET(
    request: NextRequest,
    { params }: { params: Promise<{ chatId: string }>}
) {
    try {
        const { chatId } = await params;
    
        const workspace = await chatServie.get(chatId);
    
        if (!workspace) {
            return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
        }
    
        return NextResponse.json(workspace);
    } catch (error) {
        console.error("[GET thread]", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}