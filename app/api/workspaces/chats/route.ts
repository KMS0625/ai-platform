import { NextResponse } from "next/server";
import { handler } from "@/lib/server/http";
import { CreateChatSchema } from "@/zrc/lib/schemas/chat";
import { chatServie } from "@/service/chat.servie";

export const GET = handler(async () => NextResponse.json(await chatServie.findAll()));
export const POST = handler(async request => {
    const data = CreateChatSchema.parse(await request.json());
    return NextResponse.json(await chatServie.create(data), { status: 201 });
});
