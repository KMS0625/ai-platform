import { NextResponse } from "next/server";
import { handler, noContent, notFound } from "@/lib/server/http";
import { UpdatePromptSchema } from "@/zrc/lib/schemas/prompt";
import { promptService } from "@/service/promptServie";
import { UpdateTitleSchema } from "@/zrc/lib/schemas/title";

type Params = { promptId: string };
export const PATCH = handler<Params>(async (request, { params }) => {
    const { promptId } = await params;
    const data = UpdateTitleSchema.parse(await request.json());
    return NextResponse.json(await promptService.update(promptId, data));
});
export const GET = handler<Params>(async (_request, { params }) => {
    const { promptId } = await params;
    const prompt = await promptService.get(promptId);
    return prompt ? NextResponse.json(prompt) : notFound();
});
export const PUT = handler<Params>(async (request, { params }) => {
    const { promptId } = await params;
    const data = UpdatePromptSchema.parse(await request.json());
    return NextResponse.json(await promptService.update(promptId, data));
});
export const DELETE = handler<Params>(async (_request, { params }) => {
    const { promptId } = await params;
    await promptService.delete(promptId);
    return noContent();
});
