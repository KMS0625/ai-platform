import { NextResponse } from "next/server";
import { handler, readOptionalJson } from "@/lib/server/http";
import { CreatePromptSchema } from "@/zrc/lib/schemas/prompt";
import { promptService } from "@/service/promptServie";

export const GET = handler(async () => NextResponse.json(await promptService.getAllTitle()));
export const POST = handler(async request => {
    const data = CreatePromptSchema.parse(await readOptionalJson(request));
    return NextResponse.json(await promptService.create(data), { status: 201 });
});
