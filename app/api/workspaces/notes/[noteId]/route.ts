import { Prisma } from "@/generated/prisma/client";
import { noteService } from "@/service/noteSercive";
import { NextRequest, NextResponse } from "next/server";


export async function  DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ noteId: string }>}
) {
    try {
        const { noteId } = await params;
        await noteService.delete(noteId);

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