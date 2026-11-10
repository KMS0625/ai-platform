import z from "zod";
import { CreatePageSchema } from "./page";
import type { PageResponseDto } from "./page";
import { UpdateTitleSchema } from "./title";

export const CreateNoteSchema = z.object({
    title: z.string().optional(),
    page: CreatePageSchema.optional(),
});
export type CreateNoteDto = z.infer<typeof CreateNoteSchema>;
export const UpdateNoteSchema = UpdateTitleSchema;
export type UpdateNoteDto = z.infer<typeof UpdateNoteSchema>;
export type NoteResponseDto = { id: string; title: string; order: number; createdAt: string };
export type NoteWithPagesResponseDto = NoteResponseDto & { pages: PageResponseDto[] };
export type NoteListResponseDto = NoteResponseDto[];
