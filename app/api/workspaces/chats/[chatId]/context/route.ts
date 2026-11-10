import { NextResponse } from "next/server";
import { handler, notFound } from "@/lib/server/http";
import { UpdateChatSchema } from "@/zrc/lib/schemas/chat";
import { chatServie } from "@/service/chat.servie";

type Params = { chatId: string };
const ContextSchema = UpdateChatSchema.pick({ noteId: true, promptId: true });
export const GET = handler<Params>(async (_request, { params }) => {
    const { chatId } = await params;
    const context = await chatServie.getContext(chatId);
    return context ? NextResponse.json(context) : notFound();
});
export const PUT = handler<Params>(async (request, { params }) => {
    const { chatId } = await params;
    const data = ContextSchema.parse(await request.json());
    return NextResponse.json(await chatServie.setContext(chatId, data));
});
