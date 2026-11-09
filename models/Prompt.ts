// models/Prompt.ts
export type PromptParams = {
    temperature: number;
    topP: number;
    maxInputTokens: number;
    maxOutputTokens: number;
    frequencyPenalty: number;
    presencePenalty: number;
};

export const DEFAULT_PROMPT_PARAMS: PromptParams = {
    temperature: 0.7,
    topP: 1,
    maxInputTokens: 0,
    maxOutputTokens: 2048,
    frequencyPenalty: 0,
    presencePenalty: 0,
};

export type Prompt = PromptParams & {
    id: string;
    title: string;
    description: string;
    content: string;
    createdAt: string;
    updatedAt: string;
};

export type PromptUpdateData = Partial<
    Pick<Prompt, "title" | "description" | "content"> & PromptParams
>;