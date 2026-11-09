import { Answer } from "@/models/Answer";
import { Page } from "@/models/Page";
import { Question } from "@/models/Question";
import type { Thread } from "@/models/Thread";
import type { MessageView, ThreadView } from "@/view-model/ThreadsWorkspace-vies";
import { useCallback, useState } from "react";

export function usePage() {
    const [pages, setPages] = useState<Page[]>([]);

    const appendView = useCallback((page: Page) => {
        setPages((prev) => [...prev, page]);
    }, []);

    const clearView = useCallback(() => {
        setPages([])
    }, []);

    const replaceViews = useCallback((next: Page[]) => {
        setPages(next);
    }, []);

    const deleteView = useCallback((id: string) => {
        setPages((prev) => prev.filter((page) => page.id !== id));
    }, []);

    const updateView = useCallback((id: string, data: Partial<Page>) => {
        setPages((prev) =>
            prev.map((page) =>
                page.id === id
                    ? { ...page, ...data }
                    : page
            )
        );
    }, []);

    return { pages, appendView, clearView, replaceViews, deleteView, updateView };
}