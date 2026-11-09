import { toPage, } from "@/api/mapper";
import { Page } from "@/models/Page";

export const pageApi = {
    async create(noteId: string): Promise<Page> {
        const response = await fetch(`/api/workspaces/notes/${noteId}/pages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ })
        })

        if (!response.ok) {
            throw new Error("Faild to create page");
        }

        const data = await response.json();

        return toPage(data);
    },
    async getAll(noteId: string, signal?: AbortSignal,): Promise<Page[]> {
        const response = await fetch(`/api/workspaces/notes/${noteId}/pages`, {
            method: "GET",
            signal,
        });

        if (response.status === 404) {
            throw new Error("NOT_FOUND");
        }      

        if (!response.ok) {
            throw new Error("Failed to get page");
        }

        const data = await response.json();

        return data.map(toPage);
    },
    async delete(noteId: string, pageId: string) {
        const response = await fetch(`/api/workspaces/notes/${noteId}/pages/${pageId}`, {
            method: "DELETE"
         });

        if (!response.ok) {
            throw new Error("Failed to delete page");
        }
    },
    async update(noteId: string, pageId: string, changes: Partial<Page>) {
        const response = await fetch(`/api/workspaces/notes/${noteId}/pages/${pageId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(changes),
            keepalive: true, // 탭을 닫거나 새로고침해도 요청 유지
        });

        if (!response.ok) {
            throw new Error(`페이지 저장 실패: ${response.status}`);
        }

        return response.json();
    }
}