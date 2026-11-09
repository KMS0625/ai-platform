import { ThreadCreateData } from "@/models/Thread"
import { toThread, toWorkspace } from "@/api/mapper";
import { Workspace } from "@/models/Workspace";
import { ChatContext } from "@/models/ChatContext";

export const chatApi = {
    async create(thread: ThreadCreateData) {
        const response = await fetch(`/api/workspaces/chats`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ thread })
        })

        if (!response.ok) {
            throw new Error("Faild to create workspace");
        }

        const data = await response.json();

        return {
            workspace: toWorkspace(data),
            thread: toThread(data.threads[0])
        }
    },
    async getAll() {
        const response = await fetch("/api/workspaces/chats", {
        method: "GET",
        });

        if (!response.ok) {
            throw new Error("Failed to get Workspace");
        }

        const data = await response.json();

        return data.map(toWorkspace);
    },
    async delete(chatId: string) {
        const response= await fetch(`/api/workspaces/chats/${chatId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Failed to delete Thread");
        }
    },
    async get(chatId: string): Promise<Workspace> {
        const response = await fetch(`/api/workspaces/chats/${chatId}`, {
        method: "GET",
        });

        if (!response.ok) {
            throw new Error("Failed to get Workspace");
        }

        const data = await response.json();

        return toWorkspace(data);
    },
    async getContext(chatId: string): Promise<ChatContext> {
        const response = await fetch(`/api/workspaces/chats/${chatId}/context`, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error(`Failed to get chat context: ${response.status}`);
        }

        const data = await response.json();
        return {
            noteId: data.noteId ?? null,
            promptId: data.promptId ?? null,
        };
    },
    async setContext(chatId: string, value: ChatContext): Promise<ChatContext> {
        const response = await fetch(`/api/workspaces/chats/${chatId}/context`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(value),
        });

        if (!response.ok) {
            throw new Error(`Failed to set chat context: ${response.status}`);
        }

        const data = await response.json();
        return { noteId: data.noteId ?? null, promptId: data.promptId ?? null };
    },
}