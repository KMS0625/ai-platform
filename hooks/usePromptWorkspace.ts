import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { promptApi } from "@/api/prompt/PromptApi";
import { collectionPath, sectionPath } from "@/constants/section";
import { usePromptAutoSave } from "./usePromptAutoSave";
import { useWorkspaceList } from "./useWorkspaceList";
import type { Prompt, PromptUpdateData } from "@/models/Prompt";
import { Workspace } from "@/models/Workspace";

// 프롬프트 = 워크스페이스라서 URL의 workspaceId가 곧 promptId
export function usePromptWorkspace(workspaceList: ReturnType<typeof useWorkspaceList>) {
    const params = useParams<{ workspaceId?: string }>();
    const workspaceId = params.workspaceId;
    const router = useRouter();

    const { schedule, flush, discard } = usePromptAutoSave();

    const [prompt, setPrompt] = useState<Prompt | null>(null);
    const [isSidebarLoading, setSidebarLoading] = useState(true);
    const [isPromptLoading, setPromptLoading] = useState(true);

    // URL(workspaceId)이 바뀌는 순간 이전 프롬프트의 변경분을 바로 저장
    // ※ cleanup은 선언 순서대로 실행되므로 반드시 불러오기 effect보다 위에 둘 것
    useEffect(() => {
        return () => { flush(); };
    }, [workspaceId, flush]);

    // 사이드바 목록
    useEffect(() => {
        const fetchWorkspaces = async () => {
            setSidebarLoading(true);

            try {
                const prompts = await promptApi.getAllTitle();

                const workspaces: Workspace[] = prompts.map((p) => ({
                    id: p.id,
                    title: p.title,
                    createdAt: new Date(p.createdAt),
                    order: 0,
                    noteId: null,
                    promptId: null,
                }));

                workspaceList.replaceWorkspace(workspaces);
            } catch (error) {
                console.error("프롬프트 목록 조회 실패:", error);
            } finally {
                setSidebarLoading(false);
            }
        };

        fetchWorkspaces();
    }, [workspaceList.replaceWorkspace]);

    // 현재 프롬프트
    useEffect(() => {
        if (!workspaceId) {
            setPrompt(null);
            setPromptLoading(false);
            return;
        }

        let cancelled = false;
        setPromptLoading(true);
        setPrompt(null);

        const fetchPrompt = async () => {
            try {
                const result = await promptApi.get(workspaceId);
                if (!cancelled) setPrompt(result);
            } catch (error) {
                console.error("프롬프트 조회 실패:", error);
            } finally {
                if (!cancelled) setPromptLoading(false);
            }
        };

        fetchPrompt();
        return () => { cancelled = true; };
    }, [workspaceId]);

    const createPrompt = async () => {
        try {
            const created = await promptApi.create();

            const workspace: Workspace = {
                id: created.id,
                title: created.title,
                createdAt: new Date(created.createdAt),
                order: 0,
                noteId: null,
                promptId: null,
            }

            workspaceList.prependWorkspace(workspace);
            router.push(collectionPath("prompt", created.id));
        } catch (error) {
            console.error("프롬프트 생성 실패:", error);
        }
    };

    // 화면은 컴포넌트가 직접 들고 있으므로 저장 예약만 하면 됨
    const updatePrompt = (changes: PromptUpdateData) => {
        if (!workspaceId) return;
        schedule(workspaceId, changes);
    };

    const deleteWorkspace = async (id: string) => {
        if (!id) return;

        discard(id); // 삭제할 프롬프트의 대기 중인 저장 취소 (삭제 요청보다 먼저)

        try {
            await promptApi.delete(id);
            workspaceList.deleteWorkspace(id);

            // 지금 보고 있는 프롬프트를 지웠을 때만 목록 화면으로 이동
            if (id === workspaceId) router.push(sectionPath("prompt"));
        } catch (error) {
            console.error("프롬프트 삭제 실패:", error);
        }
    };

    return {
        prompt,
        isSidebarLoading,
        isPromptLoading,
        createPrompt,
        updatePrompt,
        deleteWorkspace,
    };
}