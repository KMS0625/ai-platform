import { promptApi } from "@/api/prompt/PromptApi";
import type { PromptUpdateData } from "@/models/Prompt";
import { useAutoSave } from "./useAutoSave";

export function usePromptAutoSave(delay = 1000) {
    return useAutoSave<PromptUpdateData>({
        save: (promptId, changes) => promptApi.update(promptId, changes),
        delay,
    });
}