import { NextResponse } from "next/server";
import { handler, noContent } from "@/lib/server/http";
import { UpdatePageSchema } from "@/zrc/lib/schemas/page";
import { pageService } from "@/service/pageService";

type Params = { noteId: string; pageId: string };
export const PUT = handler<Params>(async (request, { params }) => {
    const { noteId, pageId } = await params;
    const data = UpdatePageSchema.parse(await request.json());
    return NextResponse.json(await pageService.update(noteId, pageId, data));
});
export const DELETE = handler<Params>(async (_request, { params }) => {
    const { noteId, pageId } = await params;
    await pageService.delete(noteId, pageId);
    return noContent();
});
