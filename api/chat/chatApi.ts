import { API } from "@/lib/api/route";
import { request } from "@/lib/api/client";
import type { CreateThreadDto } from "@/zrc/lib/schemas/thread";
import type { ChatResponseDto, ChatWithThreadsResponseDto, ChatContextDto } from "@/zrc/lib/schemas/chat";
import { toThread, toWorkspace } from "@/api/mapper";
import type { Workspace } from "@/models/Workspace";
import type { UpdateTitleDto } from "@/zrc/lib/schemas/title";

export const chatApi = {
    rename(chatId: string, data: UpdateTitleDto): Promise<ChatResponseDto> {
        return request<ChatResponseDto>(API.chat.detail(chatId), { method: "PATCH", json: data });
    },
    async create(thread: CreateThreadDto) {
        const data = await request<ChatWithThreadsResponseDto>(API.chat.list, { method: "POST", json: { thread } });
        return { workspace: toWorkspace(data), thread: toThread(data.threads[0]) };
    },
    async getAll(): Promise<Workspace[]> {
        const data = await request<ChatResponseDto[]>(API.chat.list);
        return data.map(toWorkspace);
    },
    delete(chatId: string): Promise<void> {
        return request<void>(API.chat.detail(chatId), { method: "DELETE" });
    },
    async get(chatId: string): Promise<Workspace> {
        return toWorkspace(await request<ChatResponseDto>(API.chat.detail(chatId)));
    },
    getContext(chatId: string): Promise<ChatContextDto> {
        return request<ChatContextDto>(API.chat.context(chatId));
    },
    setContext(chatId: string, value: ChatContextDto): Promise<ChatContextDto> {
        return request<ChatContextDto>(API.chat.context(chatId), { method: "PUT", json: value });
    },
};
