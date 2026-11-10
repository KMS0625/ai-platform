import { NextResponse } from "next/server";
import { handler, noContent, notFound } from "@/lib/server/http";
import { chatServie } from "@/service/chat.servie";
import { UpdateTitleSchema } from "@/zrc/lib/schemas/title";

type Params = { chatId: string };
export const PATCH = handler<Params>(async (request, { params }) => {
    const { chatId } = await params;
    const data = UpdateTitleSchema.parse(await request.json());
    return NextResponse.json(await chatServie.update(chatId, data));
});
export const GET = handler<Params>(async (_request, { params }) => {
    const { chatId } = await params;
    const chat = await chatServie.get(chatId);
    return chat ? NextResponse.json(chat) : notFound();
});
export const DELETE = handler<Params>(async (_request, { params }) => {
    const { chatId } = await params;
    await chatServie.delete(chatId);
    return noContent();
});
