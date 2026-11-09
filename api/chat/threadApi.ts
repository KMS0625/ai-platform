import { Thread, ThreadCreateData } from "@/models/Thread";
import { toMessageViews, toThread } from "@/api/mapper";
import { MessageView } from "@/view-model/ThreadsWorkspace-vies";

export const threadApi = {
    async create(chatId: string, thread: ThreadCreateData): Promise<Thread> {
        const response = await fetch(`/api/workspaces/chats/${chatId}/threads`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ thread })
        })

        if (!response.ok) {
            throw new Error("Faild to create workspace");
        }

        const data = await response.json();

        return toThread(data);
    },
    async getAll(chatId: string, signal?: AbortSignal,): Promise<Thread[]> {
        const response = await fetch(`/api/workspaces/chats/${chatId}/threads`, {
            method: "GET",
            signal,
        });

        if (response.status === 404) {
            throw new Error("NOT_FOUND");
        }      

        if (!response.ok) {
            throw new Error("Failed to get Thread");
        }

        const data = await response.json();

        return data.map(toThread);
    },
    async delete(chatId: string, threadId: string) {
        const response = await fetch(`/api/workspaces/chats/${chatId}/threads/${threadId}`, {
            method: "DELETE"
         });

        if (!response.ok) {
            throw new Error("Failed to delete Thread");
        }
    },
    async getMessages(chatId: string, threadId: string, signal?: AbortSignal): Promise<MessageView[]> {
        const response = await fetch(
            `/api/workspaces/chats/${chatId}/threads/${threadId}/messages`,
            { 
                method: "GET",
                signal
             },
        );

        if (response.status === 404) throw new Error("NOT_FOUND");
        if (!response.ok) throw new Error("Failed to get history");

        const data = await response.json();
        return toMessageViews([...data].reverse());
    }
}