
import { toPage, toWorkspace } from "@/api/mapper";
import { Workspace } from "@/models/Workspace";

export const noteApi = {
    async create() {
        const response = await fetch(`/api/workspaces/notes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ })
        })

        if (!response.ok) {
            throw new Error("Faild to create workspace");
        }

        const data = await response.json();

        return {
            workspace: toWorkspace(data),
            toPage: toPage(data.pages[0])
        }
    },
    async getAll(): Promise<Workspace[]> {
        const response = await fetch("/api/workspaces/notes", {
        method: "GET",
        });

        if (!response.ok) {
            throw new Error("Failed to get Workspace");
        }

        const data = await response.json();

        return data.map(toWorkspace);
    },
    async delete(noteId: string) {
        const response = await fetch(`/api/workspaces/notes/${noteId}`, {
            method: "DELETE"
        })

        if (!response.ok) {
            throw new Error("Failed to delete workspace");
        }
    }
}