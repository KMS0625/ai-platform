import { NextResponse } from "next/server";
import { handler, readOptionalJson } from "@/lib/server/http";
import { CreatePageSchema } from "@/zrc/lib/schemas/page";
import { pageService } from "@/service/pageService";

type Params = { noteId: string };
export const GET = handler<Params>(async (_request, { params }) => {
    const { noteId } = await params;
    return NextResponse.json(await pageService.getByWorkspaceId(noteId));
});
export const POST = handler<Params>(async (request, { params }) => {
    const { noteId } = await params;
    const data = CreatePageSchema.parse(await readOptionalJson(request));
    return NextResponse.json(await pageService.create(noteId, data), { status: 201 });
});
