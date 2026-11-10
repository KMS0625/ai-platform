import type { Note, Page, Prompt } from "@/generated/prisma/client";
import type { NoteResponseDto } from "@/zrc/lib/schemas/note";
import type { PageResponseDto } from "@/zrc/lib/schemas/page";
import type { PromptResponseDto } from "@/zrc/lib/schemas/prompt";

export function toNoteDto(note: Note): NoteResponseDto {
    return { ...note, createdAt: note.createdAt.toISOString() };
}
export function toPageDto(page: Page): PageResponseDto {
    return { ...page, createdAt: page.createdAt.toISOString() };
}
export function toPromptDto(prompt: Prompt): PromptResponseDto {
    return { ...prompt, createdAt: prompt.createdAt.toISOString(), updatedAt: prompt.updatedAt.toISOString() };
}
