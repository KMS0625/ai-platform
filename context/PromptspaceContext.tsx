
"use client";

import { createContext, useContext, type ReactNode } from "react";

import { usePromptWorkspace } from "@/hooks/usePromptWorkspace";
import { useWorkspaceList } from "@/hooks/useWorkspaceList";

type PromptWorkspaceContextType = {
    workspaceList: ReturnType<typeof useWorkspaceList>;
    promptWorkspace: ReturnType<typeof usePromptWorkspace>;
};

const PromptWorkspaceContext =
    createContext<PromptWorkspaceContextType | null>(null);

export function PromptWorkspaceProvider({
    children,
}: {
    children: ReactNode;
}) {
    const workspaceList = useWorkspaceList();
    const promptWorkspace = usePromptWorkspace(workspaceList);

    const value = {
        workspaceList,
        promptWorkspace,
    };

    return (
        <PromptWorkspaceContext.Provider value={value}>
            {children}
        </PromptWorkspaceContext.Provider>
    );
}

export function usePromptWorkspaceContext() {
    const ctx = useContext(PromptWorkspaceContext);

    if (!ctx) {
        throw new Error(
            "PromptWorkspaceProvider 안에서 사용해야 해요"
        );
    }

    return ctx;
}
