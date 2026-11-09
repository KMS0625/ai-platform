// hooks/useChatContext.ts
import { useCallback, useEffect, useState } from "react";
import { chatApi } from "@/api/chat/chatApi";
import type { ChatContext } from "@/models/ChatContext";

const EMPTY: ChatContext = { noteId: null, promptId: null };

export function useChatContext(workspaceId?: string) {
    const [context, setContext] = useState<ChatContext>(EMPTY);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        if (!workspaceId) {
            setContext(EMPTY);
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);

        const load = async () => {
            try {
                const workspace = await chatApi.getContext(workspaceId);
                if (cancelled) return;

                // ?? null: undefined가 와도 null로 통일
                setContext({
                    noteId: workspace.noteId ?? null,
                    promptId: workspace.promptId ?? null,
                });
            } catch (error) {
                console.error("채팅 맥락 조회 실패:", error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => { cancelled = true; };
    }, [workspaceId]);

    // ChatHelper의 onSubmit에 그대로 연결
    const saveContext = useCallback(
        async (value: ChatContext) => {
            if (!workspaceId) return;
            const saved = await chatApi.setContext(workspaceId, value);
            setContext({
                noteId: saved.noteId ?? null,
                promptId: saved.promptId ?? null,
            });
        },
        [workspaceId]
    );

    return { context, isLoading, saveContext };
}