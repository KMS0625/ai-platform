"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useNoteWorkspace } from "@/hooks/useNoteWorkspace";
import { useWorkspaceList } from "@/hooks/useWorkspaceList";

type NoteWorkspaceContextType = {
    workspaceList: ReturnType<typeof useWorkspaceList>;
    noteWorkspace: ReturnType<typeof useNoteWorkspace>;
};

const NoteWorkspaceContext =
    createContext<NoteWorkspaceContextType | null>(null);

export function NoteWorkspaceProvider({
    children,
}: {
    children: ReactNode;
}) {
    const workspaceList = useWorkspaceList();
    const noteWorkspace = useNoteWorkspace(workspaceList);

    const value = {
        workspaceList,
        noteWorkspace,
    };

    return (
        <NoteWorkspaceContext.Provider value={value}>
            {children}
        </NoteWorkspaceContext.Provider>
    );
}

export function useNoteWorkspaceContext() {
    const ctx = useContext(NoteWorkspaceContext);

    if (!ctx) {
        throw new Error(
            "NoteWorkspaceContext 안에서 사용해야 해요"
        );
    }

    return ctx;
}
