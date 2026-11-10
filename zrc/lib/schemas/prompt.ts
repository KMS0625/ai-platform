import z from "zod";

export const CreatePromptSchema = z.object({
    title: z.string().trim().optional(),
    description: z.string().trim().optional(),
    content: z.string().trim().optional(),
    temperature: z.number().optional(),
    topP: z.number().optional(),
    frequencyPenalty: z.number().optional(),
    presencePenalty: z.number().optional(),
    maxOutputTokens: z.number().optional(),
    maxInputTokens: z.number().optional(),
})

export type CreatePromptDto = z.infer<typeof CreatePromptSchema>
