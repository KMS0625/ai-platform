import { ai } from "@/lib/gemini/client";
import { sanitizeConfig } from "@/lib/gemini/config";
import { toContent, toSystemInstruction } from "@/lib/gemini/mapper";
import { ThreadMessage } from "@/types/ThreadMessage";
import { GenerateContentConfig } from "@google/genai";
import type { ChatMessage } from "@/lib/context/buildContext";

export class InvalidChatInputError extends Error {}

interface askGeminiParms {
    message: ChatMessage[];
    system?: string[];
    model: string;
    config?: GenerateContentConfig;
}

export async function  askGemini({
    message,
    model,
    config = {},
}: askGeminiParms): Promise<string> {
    console.log("gemini에게 들어가고 있는 답", message);

    const systemMessages: string[] = message
                                    .filter((m) => m.role === "system")
                                    .map((m) => m.content);
    const restMessages   = message.filter((m) => m.role !== "system");

    const context = toContent(restMessages).reverse();
    const systemParts = toSystemInstruction(systemMessages);

    try {
        const request = {
            model, 
            contents: context,
            config: {
                ...sanitizeConfig(model, config),
                ...(systemParts.length > 0 && { systemParts }),
            }
        }

        const response = await ai.models.generateContent(request);
        return response.text ?? "";
    } catch (e) {
        return Promise.resolve(`${model} request failed ${e}`);
    }
    

    
}