import { NextResponse } from "next/server";
import { handler, readOptionalJson } from "@/lib/server/http";
import { CreateNoteSchema } from "@/zrc/lib/schemas/note";
import { noteService } from "@/service/noteSercive";

export const GET = handler(async () => NextResponse.json(await noteService.findAll()));
export const POST = handler(async request => {
    const data = CreateNoteSchema.parse(await readOptionalJson(request));
    return NextResponse.json(await noteService.createWithPage(data), { status: 201 });
});
