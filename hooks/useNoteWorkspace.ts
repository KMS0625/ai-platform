import { noteApi } from "@/api/note/noteApi";
import { useWorkspaceList } from "./useWorkspaceList";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collectionPath, sectionPath } from "@/constants/section";
import { usePage } from "./usePageView";
import { pageApi } from "@/api/note/pageApi";
import { Page } from "@/models/Page";
import { usePageAutoSave } from "./usePageAutoSave";


export function useNoteWorkspace(workspaceList: ReturnType<typeof useWorkspaceList>) {
    const params = useParams<{ workspaceId?: string }>();
    const workspaceId = params.workspaceId;
    const router = useRouter();

    const { appendView, replaceViews, clearView, pages, updateView, deleteView} = usePage();
    const { schedule, flush } = usePageAutoSave(workspaceId);

    const [isSidebarLoading, setSidebarLoading] = useState(true);
    const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(true);

    useEffect(() => {
        return () => { flush(); };
    }, [workspaceId, flush]);

    const createNote = async () => {    
            try {
                const result = await noteApi.create();
    
                const workspace = result.workspace;
    
                workspaceList.prependWorkspace(workspace);
                router.push(collectionPath("note", workspace.id))
            } catch (error) {
                console.log(error);
            }
    }

    useEffect(() => {
            const fetchWorkspaces = async () => {
                setSidebarLoading(true);
    
                try {
                    const workspaces = await noteApi.getAll();
                    workspaceList.replaceWorkspace(workspaces)
                } catch (error) {
                    console.error("워크스페이스 조회 실패:", error);
                } finally {
                    setSidebarLoading(false);
                }
            };
    
            fetchWorkspaces();
        }, [workspaceId, workspaceList.replaceWorkspace]);

    useEffect(() => {
            if (!workspaceId) {
                clearView();
                setIsWorkspaceLoading(false);
                return;
            }
    
            const controller = new AbortController();
    
            const fetchThreads = async () => {
                setIsWorkspaceLoading(true);
    
                try {
                    const pages = await pageApi.getAll(workspaceId);
                    replaceViews(pages);
    
                    if (controller.signal.aborted) return;
                } catch (error) {
                    if (error instanceof Error && error.name === "AbortError") {
                        return;
                    }
                    alert(`${params.workspaceId} 잘못된 접근`);
                    router.push(sectionPath("note"))
                } finally {
                    setIsWorkspaceLoading(false);
                }
            }
    
            fetchThreads();
            return () => { controller.abort(); };
        }, [workspaceId, replaceViews]);

        const deleteWorkspace = async (workspaceId: string) => {
                if (!workspaceId)
                    return;
        
                console.log("workspace 삭제시도");
        
                try {
                    console.log("notespace 시도");
                    await noteApi.delete(workspaceId);
                    workspaceList.deleteWorkspace(workspaceId);
                    
                } catch (error) {
                    console.log(error);
                }
            }

        const updatePage = (pageId: string, changes: Partial<Page>) => {
            updateView(pageId, changes);   // 화면 즉시 반영
            schedule(pageId, changes);     // 저장은 디바운스
        };

        const createPage = async () => {
            if (!workspaceId)
                return;

            try {
                const page = await pageApi.create(workspaceId);
                appendView(page);
    
            } catch (error) {
                console.error("페이지 조회 실패:", error); 
                alert(`${params.workspaceId} 잘못된 접근`)
                router.push(sectionPath('note'))
            }
        }

        const deletePage = async (pageId: string) => {
            if (!workspaceId)
                return;

            try {
                await pageApi.delete(workspaceId, pageId)
                const isEmpty = deleteView(pageId);

                if (isEmpty) {
                    deleteWorkspace(workspaceId);
                    router.push(sectionPath('note'));
                }
            } catch (error) {
                console.error("페이지 삭제 실패:", error); 
            }
            
        }

    const renameWorkspace = async (id: string, title: string) => {
        const updated = await noteApi.rename(id, { title });
        workspaceList.renameWorkspace(id, updated.title);
    };

    return { createNote, pages, deleteWorkspace, renameWorkspace, updatePage, createPage, deletePage, isWorkspaceLoading }
}

