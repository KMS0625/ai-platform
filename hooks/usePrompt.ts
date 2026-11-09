import { Prompt } from "@/models/Prompt"
import { useCallback, useState } from "react"

export function usePrompt() {
    const [promptView, setPromptView] = useState<Prompt>();

    const updateView = useCallback((data: Partial<Prompt>) => {
        setPromptView((prev) => {
            if (!prev) return prev;
            return { ...prev, ...data };
        });
    }, []);

    const replaceViews = useCallback((prompt: Prompt) => {
        setPromptView(prompt);
    }, []);

    const clearView = useCallback(() => {
        setPromptView(undefined);
    }, []);

    return { promptView, updateView, replaceViews, clearView };
}