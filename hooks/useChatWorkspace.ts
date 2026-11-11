import { ThreadCreateData } from "@/models/Thread";

import { useWorkspaceList } from "./useWorkspaceList";
import { useThread } from "./useThread";
import { useParams, useRouter } from "next/navigation";
import { collectionPath, sectionPath } from "@/constants/section";
import { useCallback, useEffect, useRef, useState } from "react";
import { useThreadView } from "./useThreadViews";
import { ModelInfo } from "@/lib/models";

import { chatApi } from "@/api/chat/chatApi";
import { threadApi } from "@/api/chat/threadApi";
import { questionApi } from "@/api/chat/questionApi";
import { QuestionCreateData } from "@/models/Question";
import { AnswerApi } from "@/api/chat/answerApi";
import { useChatContext } from "./useChatContext";
import { similarityApi } from "@/api/similarity/similarityApi";
import { pageApi } from "@/api/note/pageApi";
import type { CreatePageDto } from "@/zrc/lib/schemas/page";
import type { PageSimilarityDto } from "@/zrc/lib/schemas/similarity";
import { string } from "zod";

type LoadingType = 
    | "thread"
    | "initial"
    | "answer"
    | "delete" 
    | "pages"
    | null;

export function useChatWorkspace(workspaceList: ReturnType<typeof useWorkspaceList>) {
    const { replaceThreads, clearThreads } = useThread();
    const { threadViews, appendView, clearView, deleteView, appendQuestion, appendAnswer, setWaitingForResponse } = useThreadView();

    const params = useParams<{ workspaceId?: string }>();
    const workspaceId = params.workspaceId;
    const router = useRouter();

    const [loading, setLoading] = 
        useState<LoadingType>(null);
    
    const sendingRef = useRef(false)
    const [isLoading, setIsLoading] = useState(false);
    const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(true);
    const [isSidebarLoading, setSidebarLoading] = useState(true);
    const [isDeleting, setDeleting] = useState(false);
    const [isWating, setWaiting] = useState(false);

    const chatId = params.workspaceId;
    // useEffect(() => {
    //     const fectchSide = async () => {
    //         setLoading("initial");

    //         try {
    //             const chats = await chatApi.getAll();
    //             workspaceList.replaceWorkspace(chats);
    //         } catch(error) {
    //             console.error("채팅 목록 조회 실패:", error);
    //         } finally {
    //             setLoading(null);
    //         }
    //     }

    //     fectchSide();
    // }, [workspaceList.replaceWorkspace])

    // useEffect(() => {
    //     clearView();
    //     if (!chatId) {
    //         setLoading(null);
    //         return;
    //     }

    //     const controller = new AbortController();
    //     const fectchThread = async () => {
    //         setLoading("thread");
    //         try {
    //             const threadSet = await threadApi.getAll(chatId);
    //             threadSet.map( async (thread) => {
    //                 try {
    //                     const histories = await threadApi.getMessages(chatId, thread.id, controller.signal);
    //                     appendView(thread, histories);
    //                 } catch (error) {
    //                     console.error(`Failed to load thread id: ${thread.id} error: ${error}`);
    //                 }
    //             })
    //         } catch (error) {
    //             console.error(`Failed to load threadSet error: ${error}`);
    //         } finally {
    //             setLoading(null);
    //         }
    //     } 

    //     fectchThread();
    // }, [chatId])
    
    useEffect(() => {
        clearView();
        const fetchWorkspaces = async () => {
            setSidebarLoading(true);

            try {
                const workspaces = await chatApi.getAll();

                workspaceList.replaceWorkspace(workspaces)
            } catch (error) {
                console.error("워크스페이스 조회 실패:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWorkspaces();
    }, [workspaceId, workspaceList.replaceWorkspace]);

    useEffect(() => {
        clearView();
        if (!workspaceId) {
            setIsWorkspaceLoading(false);
            return;
        }

        const controller = new AbortController();

        const fetchThreads = async () => {
            setIsWorkspaceLoading(true);

            try {
                const threadSet = await threadApi.getAll(workspaceId, controller.signal);
                    threadSet.map(async (t) => {
                    const message = await threadApi.getMessages(workspaceId, t.id, controller.signal);

                    appendView(t, message);
                })

                if (controller.signal.aborted) return;

            } catch (error) {
                if (error instanceof Error && error.name === "AbortError") {
                    return;
                }
                alert(`${params.workspaceId} 잘못된 접근`)
                router.push(sectionPath('chat'))
            } finally {
                setIsWorkspaceLoading(false);
            }
        }

        fetchThreads();
        return () => { controller.abort(); };
    }, [workspaceId, replaceThreads, clearThreads]);

    // 새로운 채팅 시작시 사용
    const createNewWorkspace = async (model: ModelInfo) => {
        const threadData: ThreadCreateData = {
            model: model.model,
        }

        try {
            const result = await chatApi.create(threadData);

            const workspace = result.workspace;

            workspaceList.prependWorkspace(workspace);
            router.push(collectionPath("chat", workspace.id))
        } catch (error) {
            console.log(error);
        }
    }

    const createNewThread = async (model: ModelInfo) => {
        if (!workspaceId)
            return;
        
        const threadData: ThreadCreateData = {
            model: model.model,
        }

        try {
            const thread = await threadApi.create(workspaceId, threadData);
            appendView(thread);

        } catch (error) {
            console.log(error);
            alert(`${params.workspaceId} 잘못된 접근`)
            router.push(sectionPath('chat'))
        }
    }

    const deleteThread = async (threadId: string) => {
        if (!workspaceId)
            return;

        try {
            await threadApi.delete(workspaceId, threadId);
            const becameEmpty = deleteView(threadId);

            if (becameEmpty) {
                setDeleting(true);
                deleteWorkspace(workspaceId);
                router.push(sectionPath("chat"))
            }
        } catch (error) {
            console.log(error);
        } finally {
            setDeleting(false);
        }
    }

    const deleteWorkspace = async (workspaceId: string) => {
        if (!workspaceId)
            return;

        console.log("workspace 삭제시도");

        try {
            setDeleting(true);
            await chatApi.delete(workspaceId);
            workspaceList.deleteWorkspace(workspaceId);
            
        } catch (error) {
            console.log(error);
        } finally {
            setDeleting(false);
        }
    }
    
    const sendQuestion = async (value: string) => {
        if (!workspaceId)
            return;

        const questionData: QuestionCreateData = {
            content: value,
        }

        try {
            const question = await questionApi.create(workspaceId, questionData);
            appendQuestion(question);

            setWaiting(true);
            const controller = new AbortController();
            controllerRef.current = controller;
            await Promise.allSettled(
                threadViews.map(async (thread) => {
                    try {
                        setWaitingForResponse(thread.thread.id, true);
                        
                        const answer = await AnswerApi.getAnswer(
                            workspaceId,
                            thread.thread.id,
                            question.id,
                            thread.thread.model,
                            question.content,
                            controller.signal,
                        );
                        appendAnswer(answer); // 먼저 온 순서대로 반영
                    } catch (error) {
                        if (error instanceof Error && error.name === "AbortError") {
                            return;
                        }
                        console.log(`thread ${thread.thread.id} 답변 실패`, error);
                    } finally {
                        setWaitingForResponse(thread.thread.id, false);
                    }
                }),
            );
        } catch (error) {
            console.log(error);
        } finally {
            setWaiting(false);
        }
    }

    const renameWorkspace = async (id: string, title: string) => {
        const updated = await chatApi.rename(id, { title });
        workspaceList.renameWorkspace(id, updated.title);
    };

    const { context, saveContext } = useChatContext(workspaceId);

    const compareNotePages = useCallback((source: string, signal?: AbortSignal) =>
        similarityApi.calculate({ source, noteId: workspaceId ? context.noteId : null }, signal), [workspaceId, context.noteId]);

    const controllerRef = useRef<AbortController|null>(null);

    const makePage = async (draft: CreatePageDto) => {
        if (!workspaceId || !context.noteId) {
            throw new Error("채팅에 연결된 노트가 없습니다.");
        }
        return pageApi.create(context.noteId, draft);
    };

    const getSimiralityPages = useCallback(async (draft: CreatePageDto, signal?: AbortSignal): Promise<PageSimilarityDto[]> => {
        if (!workspaceId || !context.noteId || !draft.content?.trim()) {
            return [];
        }

        const { items } = await compareNotePages(draft.content, signal);

        return [...items].sort((a, b) => b.score - a.score).slice(0, 3);
    }, [workspaceId, context.noteId, compareNotePages]);

    // pags
    // const getPages = useCallback(async (source: string) => {
    //     if (!chatId || !context.noteId || !source.trim()) {
    //         return;
    //     }

    //     const controller = new AbortController();
    //     setLoading("pages");
    //     const noteId = context.noteId;
    //     try {
    //         const { items } = await similarityApi.calculate({source, noteId}, controller.signal);

    //         return [...items].sort((a, b) => b.score - a.score).slice(0, 3);
    //     } catch (error) {
    //         if (error instanceof Error && error.name === "AbortError") {
    //                 return;
    //         }
    //         console.log(`Fail to load simirality pags error: ${error}`);
    //         return [];
    //     } finally {
    //         setLoading(null);
    //     }
    // }, [workspaceId, context.noteId])

    const handleStop = () => {
        controllerRef.current?.abort();
    }

    return { 
        renameWorkspace,
        compareNotePages,
        getSimiralityPages,
        context, 
        createNewWorkspace, 
        createNewThread, 
        deleteThread, 
        deleteWorkspace, 
        sendQuestion, 
        threadViews, 
        isWorkspaceLoading, 
        saveContext, 
        setIsWorkspaceLoading,
        isDeleting, 
        isWating,
        handleStop,
        makePage,
    }
}

