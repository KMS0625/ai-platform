"use client"
import { SpinnerOverlay } from "@/components/Spinner/spinner";
import ThreadsWorkspace from "@/components/threadsWorkspace/ThreadsWorkspace";
import { useChatWorkspaceContext } from "@/context/ChatspaceContext";

export default function chatPage() {
    const { chatWorkspace: { threadViews, isWorkspaceLoading, isDeleting} } = useChatWorkspaceContext();

    if (isWorkspaceLoading) return <SpinnerOverlay />;
    
    return (
        <ThreadsWorkspace threadsView={threadViews}/>
    );
}