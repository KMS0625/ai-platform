"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useChatWorkspace } from "@/hooks/useChatWorkspace";
import { useWorkspaceList } from "@/hooks/useWorkspaceList";

const ChatWorkspaceContext = createContext<ChatWorkspaceContextType | null>(null);

type ChatWorkspaceContextType = {
    workspaceList: ReturnType<typeof useWorkspaceList>;
    chatWorkspace: ReturnType<typeof useChatWorkspace>;
};

export function ChatWorkspaceProvider({
    children,
}: {
    children: ReactNode;
}) {
    const workspaceList = useWorkspaceList();
    const chatWorkspace = useChatWorkspace(workspaceList);

    const value = {
        workspaceList,
        chatWorkspace,
    };

    return (
        <ChatWorkspaceContext.Provider value={value}>
            {children}
        </ChatWorkspaceContext.Provider>
    );
}

export function useChatWorkspaceContext() {
    const ctx = useContext(ChatWorkspaceContext);

    if (!ctx) {
        throw new Error("ChatWorkspaceProvider 안에서 사용해야 해요");
    }

    return ctx;
}