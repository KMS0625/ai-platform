import { promptService } from "@/service/promptServie";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const prompts = await promptService.getAllTitle();
        return NextResponse.json(prompts);
    } catch (error) {
        console.error("[GET prompts]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
 
export async function POST() {
    try {
        console.log("작동됨?");
        const prompt = await promptService.create();
        console.log("ㅇㅇㅇ?", prompt);
        return NextResponse.json(prompt, { status: 201 });
    } catch (error) {
        console.error("[POST prompt]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
 