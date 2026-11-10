import { API } from "@/lib/api/route";
import { request } from "@/lib/api/client";
import { toPage } from "@/api/mapper";
import type { Page } from "@/models/Page";
import type { CreatePageDto, PageResponseDto, PageListResponseDto, UpdatePageDto } from "@/zrc/lib/schemas/page";

export const pageApi = {
    async create(noteId: string, data: CreatePageDto = {}): Promise<Page> {
        const created = await request<PageResponseDto>(API.note.pages(noteId), { method: "POST", json: data });
        return toPage(created);
    },
    async getAll(noteId: string, signal?: AbortSignal): Promise<Page[]> {
        const data = await request<PageListResponseDto>(API.note.pages(noteId), { signal });
        return data.map(toPage);
    },
    delete(noteId: string, pageId: string): Promise<void> {
        return request<void>(API.note.pageDetail(noteId, pageId), { method: "DELETE" });
    },
    update(noteId: string, pageId: string, changes: UpdatePageDto): Promise<PageResponseDto> {
        return request<PageResponseDto>(API.note.pageDetail(noteId, pageId), { method: "PUT", json: changes, keepalive: true });
    },
};
