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

export const UpdatePromptSchema = CreatePromptSchema;
export type UpdatePromptDto = z.infer<typeof UpdatePromptSchema>;
export type PromptParamsDto = {
    temperature: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
    maxOutputTokens: number;
    maxInputTokens: number;
};
export type PromptResponseDto = PromptParamsDto & {
    id: string;
    title: string;
    description: string;
    content: string;
    createdAt: string;
    updatedAt: string;
};
export type PromptListItemDto = Pick<PromptResponseDto, "id" | "title" | "createdAt">;
export type PromptListResponseDto = PromptListItemDto[];
