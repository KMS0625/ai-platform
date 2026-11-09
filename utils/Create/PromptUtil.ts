// import type { Prompt, PromptParameters } from "@/types/prompt";
// import { DEFAULT_PARAMETERS } from "@/types/prompt";

// export function createParameters(
//     temperature: number,
//     topP: number,
//     topK: number,
//     maxTokens: number,
//     frequencyPenalty: number,
//     presencePenalty: number
// ): PromptParameters {
//     return {
//         temperature,
//         topP,
//         topK,
//         maxTokens,
//         frequencyPenalty,
//         presencePenalty,
//     }
// }

// export function createPrompt(
//     id: string,
//     title: string,
//     description: string,
//     tages: string[],
//     parameters: PromptParameters,
//     content:string = "",
// ): Prompt {
//     return {
//         id,
//         title,
//         description,
//         tages,
//         parameters,
//         content,
//     }
// }

// export function createDefaultPrompt(id: string): Prompt {
//     return createPrompt(
//         id,
//         "새 프롬프트",
//         "",
//         [],
//         { ...DEFAULT_PARAMETERS },
//         "",
//     );
// }