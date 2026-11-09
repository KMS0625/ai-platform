// import { ai } from "@/lib/gemini/client";
// import { sanitizeConfig } from "@/lib/gemini/config";
// import { toContent, toSystemInstruction } from "@/lib/gemini/mapper";
// import { ThreadMessage } from "@/types/ThreadMessage";
// import { GenerateContentConfig } from "@google/genai";

// export class InvalidChatInputError extends Error {}

// interface askGeminiParms {
//     histories: ThreadMessage[];
//     answer: string;
//     system?: string[];
//     model: string;
//     config?: GenerateContentConfig;
// }

// export async function  askGemini({
//     histories,
//     answer,
//     system = [],
//     model,
//     config = {},
// }: askGeminiParms): Promise<string> {
//     histories.push({role: "user", content: answer})

//     const context = toContent(histories);

//     const respons = await ai.models.generateContent({
//         model, 
//         contents: context,
//         config: {
//             ...sanitizeConfig(model, config),
//             ...(system.length > 0 && { systemInstruction: toSystemInstruction(system) }),
//         }
//     })

//     return respons.text ?? "";
// }