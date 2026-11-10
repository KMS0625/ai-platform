import { API } from "@/lib/api/route";
import { request } from "@/lib/api/client";
import type { Thread } from "@/models/Thread";
import type { CreateThreadDto, ThreadListResponseDto, ThreadResponseDto } from "@/zrc/lib/schemas/thread";
import type { MessageHistoryResponseDto } from "@/zrc/lib/schemas/message";
import { toMessageViews, toThread } from "@/api/mapper";
import type { MessageView } from "@/view-model/ThreadsWorkspace-vies";

export const threadApi = {
    async create(chatId: string, thread: CreateThreadDto): Promise<Thread> {
        const data = await request<ThreadResponseDto>(API.chat.threads(chatId), { method: "POST", json: { thread } });
        return toThread(data);
    },
    async getAll(chatId: string, signal?: AbortSignal): Promise<Thread[]> {
        const data = await request<ThreadListResponseDto>(API.chat.threads(chatId), { signal });
        return data.map(toThread);
    },
    delete(chatId: string, threadId: string): Promise<void> {
        return request<void>(API.chat.threadDetail(chatId, threadId), { method: "DELETE" });
    },
    async getMessages(chatId: string, threadId: string, signal?: AbortSignal): Promise<MessageView[]> {
        const data = await request<MessageHistoryResponseDto>(API.chat.messages(chatId, threadId), { signal });
        return toMessageViews([...data].reverse());
    },
};
