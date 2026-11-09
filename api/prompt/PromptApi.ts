import type { Prompt, PromptUpdateData } from "@/models/Prompt";

export const promptApi = {
    async getAllTitle(): Promise<Prompt[]> {
        const response = await fetch("/api/workspaces/prompts");

        if (!response.ok) {
            throw new Error(`Failed to get prompts: ${response.status}`);
        }

        return response.json();
    },

    async create(): Promise<Prompt> {
        const response = await fetch("/api/workspaces/prompts", {
            method: "POST",
        });
        console.log("djfksjf");
        if (!response.ok) {
            throw new Error(`Failed to create prompt: ${response.status}`);
        }

        return response.json();
    },

    async delete(promptId: string): Promise<void> {
        const response = await fetch(`/api/workspaces/prompts/${promptId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error(`Failed to delete prompt: ${response.status}`);
        }
    },

    async get(promptId: string): Promise<Prompt> {
        const response = await fetch(`/api/workspaces/prompts/${promptId}`, {
            method: "GET",
        });


        if (!response.ok) {
            throw new Error(`Failed to get prompt: ${response.status}`);
        }

        return response.json();
    },

    async update(promptId: string, changes: PromptUpdateData): Promise<Prompt> {
        const response = await fetch(`/api/workspaces/prompts/${promptId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(changes),
            keepalive: true, // 탭을 닫거나 새로고침해도 요청 유지 (본문 64KB 초과 시 거부됨)
        });

        console.log("실행되었다");
        if (!response.ok) {
            throw new Error(`Failed to update prompt: ${response.status}`);
        }

        return response.json();
    },
};