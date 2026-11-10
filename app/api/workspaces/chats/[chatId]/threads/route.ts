import z from "zod";
import { NextResponse } from "next/server";
import { handler } from "@/lib/server/http";
import { CreateThreadSchema } from "@/zrc/lib/schemas/thread";
import { threadService } from "@/service/thread.servie";

type Params = { chatId: string };
const RequestSchema = z.object({ thread: CreateThreadSchema });
export const GET = handler<Params>(async (_request, { params }) => {
    const { chatId } = await params;
    return NextResponse.json(await threadService.getByWorkspaceId(chatId));
});
export const POST = handler<Params>(async (request, { params }) => {
    const { chatId } = await params;
    const { thread } = RequestSchema.parse(await request.json());
    return NextResponse.json(await threadService.create(chatId, thread), { status: 201 });
});
