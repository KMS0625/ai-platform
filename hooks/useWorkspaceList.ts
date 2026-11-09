import { Section } from "@/constants/section";
import { Workspace } from "@/models/Workspace";
import { useCallback, useState } from "react";

export function useWorkspaceList() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

    const prependWorkspace = useCallback( (workspace: Workspace) => {
        setWorkspaces(prev => [workspace, ...prev]);
    }, []);

    const replaceWorkspace = useCallback((next: Workspace[]) => {
        setWorkspaces(next);
    }, []);

    const deleteWorkspace = (id: string) => {
        setWorkspaces((prev) =>
            prev.filter((ws) => ws.id !== id)
        );
    }

    return { workspaces, setWorkspaces, prependWorkspace, replaceWorkspace, deleteWorkspace };
}