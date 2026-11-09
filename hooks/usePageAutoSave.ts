import { pageApi } from "@/api/note/pageApi";
import { Page } from "@/models/Page";
import { useAutoSave } from "./useAutoSave";

export function usePageAutoSave(noteId?: string, delay = 1000) {
    return useAutoSave<Page>({
        save: async (pageId, changes) => {
            if (!noteId) return;
            await pageApi.update(noteId, pageId, changes);
        },
        delay,
    });
}