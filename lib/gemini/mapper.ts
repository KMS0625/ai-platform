import { ThreadMessage } from "@/types/ThreadMessage";
import { Content, Part } from "@google/genai";
import type { ChatMessage } from "@/lib/context/buildContext";

export function toContent(messages: ChatMessage[]): Content[] {
    return messages.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
    }))
}

export function toSystemInstruction(system: string[]): Part[] {
  return system.map((text) => ({ text }));
}