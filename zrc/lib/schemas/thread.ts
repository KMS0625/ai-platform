import z from "zod";

export const CreateThreadSchema = z.object({
    title: z.string().trim().optional(),
    model: z.string().trim(),
})

export type CreateThreadDto = z.infer<typeof CreateThreadSchema>