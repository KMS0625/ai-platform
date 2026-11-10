import { handler, noContent } from "@/lib/server/http";
import { noteService } from "@/service/noteSercive";
import { NextResponse } from "next/server";
import { UpdateTitleSchema } from "@/zrc/lib/schemas/title";

export const PATCH = handler<{ noteId: string }>(async (request, { params }) => {
    const { noteId } = await params;
    const data = UpdateTitleSchema.parse(await request.json());
    return NextResponse.json(await noteService.update(noteId, data));
});

export const DELETE = handler<{ noteId: string }>(async (_request, { params }) => {
    const { noteId } = await params;
    await noteService.delete(noteId);
    return noContent();
});
