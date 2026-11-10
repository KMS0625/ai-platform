import "server-only"
import { NextRequest, NextResponse } from "next/server"
import z from "zod"

export const ok = <T>(data: T, status = 200) => NextResponse.json(data, { status })
export const fail = (message: string, status = 400, extra?: object) =>
    NextResponse.json({ error: message, ...extra }, { status })

export async function parseBody<S extends z.ZodType>(req: Request, schema: S) {
    const raw = await req.json().catch(() => null)
    const result = schema.safeParse(raw)
    if (!result.success) {
        return { error: fail("invalid body", 400, { details: result.error.flatten() }) } as const
    }
    return { data: result.data as z.infer<S> } as const
}

// lib/server/http.ts (이어서)
type Handler<C> = (req: Request, ctx: C) => Promise<Response>

export function handler<C>(fn: Handler<C>): Handler<C> {
    return async (req, ctx) => {
        try {
            return await fn(req, ctx)
        } catch (e) {
            console.error(e)
            return fail("internal error", 500)
        }
    }
}

// export function parseQuery<S extends z.ZodType>(req: Request, schema: S) {
//     const params = Object.fromEntries(new URL(req.url).searchParams)
//     const result = schema.safeParse(params)
//     if (!result.success) {
//         return { error: fail("invalid query", 400, { details: result.error.flatten() }) } as const
//     }
//     return { data: result.data as z.infer<S> } as const
// }


// // lib/server/http.ts (이어서)
// type Handler<C> = (req: Request, ctx: C) => Promise<Response>

// export function handler<C>(fn: Handler<C>): Handler<C> {
//     return async (req, ctx) => {
//         try {
//             return await fn(req, ctx)
//         } catch (e) {
//             console.error(e)
//             return fail("internal error", 500)
//         }
//     }
// }

// export const IdSchema = z.uuid()

// export async function getId(ctx: { params: Promise<{ id: string }> }) {
//     const { id } = await ctx.params
//     const r = IdSchema.safeParse(id)
//     return r.success ? { id: r.data } as const : { error: fail("invalid id") } as const
// }