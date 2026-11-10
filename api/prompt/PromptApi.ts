import { API } from "@/lib/api/route";
import { request } from "@/lib/api/client";
import type { CreatePromptDto, PromptResponseDto, PromptListResponseDto, UpdatePromptDto } from "@/zrc/lib/schemas/prompt";
import type { UpdateTitleDto } from "@/zrc/lib/schemas/title";

export const promptApi = {
    rename(promptId: string, data: UpdateTitleDto): Promise<PromptResponseDto> {
        return request<PromptResponseDto>(API.prompt.detail(promptId), { method: "PATCH", json: data });
    },
    getAllTitle(): Promise<PromptListResponseDto> {
        return request<PromptListResponseDto>(API.prompt.list);
    },
    create(data: CreatePromptDto = {}): Promise<PromptResponseDto> {
        return request<PromptResponseDto>(API.prompt.list, { method: "POST", json: data });
    },
    delete(promptId: string): Promise<void> {
        return request<void>(API.prompt.detail(promptId), { method: "DELETE" });
    },
    get(promptId: string): Promise<PromptResponseDto> {
        return request<PromptResponseDto>(API.prompt.detail(promptId));
    },
    update(promptId: string, changes: UpdatePromptDto): Promise<PromptResponseDto> {
        return request<PromptResponseDto>(API.prompt.detail(promptId), { method: "PUT", json: changes, keepalive: true });
    },
};
