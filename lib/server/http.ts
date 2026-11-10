import "server-only";
import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { ZodError } from "zod";

type RouteContext<Params> = { params: Promise<Params> };

export function handler<Params = Record<string, never>>(
    action: (request: Request, context: RouteContext<Params>) => Promise<Response>,
) {
    return async (request: Request, context: RouteContext<Params>): Promise<Response> => {
        try {
            return await action(request, context);
        } catch (error) {
            if (request.signal.aborted) return new Response(null, { status: 499 });
            if (error instanceof SyntaxError) {
                return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
            }
            if (error instanceof ZodError) {
                return NextResponse.json({ error: "INVALID_INPUT", issues: error.issues }, { status: 400 });
            }
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === "P2025") return notFound();
                if (error.code === "P2003") {
                    return NextResponse.json({ error: "INVALID_REFERENCE" }, { status: 400 });
                }
            }
            console.error(`[${request.method} ${new URL(request.url).pathname}]`, error);
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
    };
}

export function notFound() {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
}

export function noContent() {
    return new Response(null, { status: 204 });
}

export async function readOptionalJson(request: Request): Promise<unknown> {
    const text = await request.text();
    return text.trim() ? JSON.parse(text) : {};
}
