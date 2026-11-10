import { API } from "@/lib/api/route";
import { request } from "@/lib/api/client";
import { toPage, toWorkspace } from "@/api/mapper";
import type { Workspace } from "@/models/Workspace";
import type { CreateNoteDto, NoteWithPagesResponseDto, NoteListResponseDto } from "@/zrc/lib/schemas/note";
import type { NoteResponseDto } from "@/zrc/lib/schemas/note";
import type { UpdateTitleDto } from "@/zrc/lib/schemas/title";

export const noteApi = {
    rename(noteId: string, data: UpdateTitleDto): Promise<NoteResponseDto> {
        return request<NoteResponseDto>(API.note.detail(noteId), { method: "PATCH", json: data });
    },
    async create(data: CreateNoteDto = {}) {
        const created = await request<NoteWithPagesResponseDto>(API.note.list, { method: "POST", json: data });
        return { workspace: toWorkspace(created), toPage: toPage(created.pages[0]) };
    },
    async getAll(): Promise<Workspace[]> {
        const data = await request<NoteListResponseDto>(API.note.list);
        return data.map(toWorkspace);
    },
    delete(noteId: string): Promise<void> {
        return request<void>(API.note.detail(noteId), { method: "DELETE" });
    },
};
