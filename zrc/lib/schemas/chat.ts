import z from "zod";
import { CreateThreadSchema } from "./thread";
import type { ThreadResponseDto } from "./thread";

export const CreateChatSchema = z.object({
    title: z.string().trim().optional(),
    thread: CreateThreadSchema,
});

export const UpdateChatSchema = z.object({
    title: z.string().trim().optional(),
    noteId: z.uuid().nullish(),
    promptId: z.uuid().nullish(),
});

export type ChatResponseDto = {
    id: string,
    title: string;
    createdAt: string;
    order: number;
    noteId: string | null;
    promptId: string | null;
};

export type ChatWithThreadsResponseDto = ChatResponseDto & { threads: ThreadResponseDto[] };
export type ChatContextDto = Pick<ChatResponseDto, "noteId" | "promptId">;


// export const ChatListQuerySchema = z.object({
//     take: z.coerce.number().int().min(1).max(100).default(20),
//     cursor: z.uuid().optional(),
// })

// export type ChatListResponseDto = {
//     items: ChatListItemDto[]
//     nextCursor: string | null
// }

export type ChatListResponseDto = {
    items: ChatListItemDto[]
}

export type CreateChatDto = z.infer<typeof CreateChatSchema>

export type UpdateChatDto = z.infer<typeof UpdateChatSchema>

export type ChatListItemDto = Pick<ChatResponseDto, "id" | "title" | "createdAt" | "promptId" | "noteId">


// export type ChatListQuery = z.infer<typeof ChatListQuerySchema>
