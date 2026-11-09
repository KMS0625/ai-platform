"use client"

import ThreadsWorkspace from "@/components/threadsWorkspace/ThreadsWorkspace";
import { useChatWorkspaceContext } from "@/context/ChatspaceContext";

export default function chatPage() {
    const { chatWorkspace: {threadViews} } = useChatWorkspaceContext();
    
    return (
        <ThreadsWorkspace threadsView={threadViews}/>
    );
}