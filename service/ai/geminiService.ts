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
    message.reverse(); // 메시지는 최신 -> 나중 순으로 되고 있다. 그러므로 gemini에 맞게 역순

    console.log("========================================")
    console.log("[Gemini Request]")
    console.log("Model:", model)
    console.log("Message Count:", message.length)

    message.forEach((m, i) => {
        console.log(`\n[${i}] ${m.role}`)
        console.log(m.content)
    })

    console.log("========================================")
    const systemMessages: string[] = message
                                    .filter((m) => m.role === "system")
                                    .map((m) => m.content);
    const systemParts = toSystemInstruction(systemMessages);
    const systemPrompt = systemParts.length > 0
        ? systemParts
        : undefined;

    const restMessages   = message.filter((m) => m.role !== "system");

    const context = toContent(restMessages);
    

    try {
        const request = {
            model, 
            contents: context,
            config: {
                ...sanitizeConfig(model, config),
                ...(systemPrompt),
            }
        }

        const response = await ai.models.generateContent(request);
        return response.text ?? "";
    } catch (e) {
        return Promise.resolve(`${model} request failed ${e}`);
    }
    

    
}