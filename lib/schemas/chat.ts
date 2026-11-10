import z from "zod";

const CreateChatSchema = z.object({
    title: z.string().trim().optional(),
})

const UpdateChatSchema = z.object({
    title: z.string().trim().nullable(),
    noteId: z.uuid().nullish(),
    promptId: z.uuid().nullish(),
})

export type CreateChatDto = z.infer<typeof CreateChatSchema>

export type UpdateChatDto = z.infer<typeof UpdateChatSchema>

export type ChatResponseDto = {
    id: string,
    title: string;
    createAt: string;
    updateAt: string;
    noteId: string | null;
    promptId: string | null;
}