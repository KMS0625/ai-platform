import { NextRequest, NextResponse } from "next/server";
import { pageService } from "@/service/pageService";
import { PageUpdateData } from "@/models/Page";
import { Prisma } from "@/generated/prisma/client";


export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ noteId: string, pageId: string }> }
) {
   
    try {
        const { noteId, pageId } = await params;
        const body: PageUpdateData = await request.json();
        const page = await pageService.update(noteId, pageId, body);
        if (!page) {
            return NextResponse.json({ message: "페이지 없음" }, { status: 404 });
        }
        return NextResponse.json(page);
    } catch (error) {
        console.error("페이지 수정 실패:", error);
        return NextResponse.json({ message: "서버 오류" }, { status: 500 });
    }
}

export async function  DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ noteId: string, pageId: string }>}
) {
    try {
        console.error("dklfjslkadjflskdjflkajsdfk")
        const { noteId, pageId } = await params;

        await pageService.delete(noteId, pageId);

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