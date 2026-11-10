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

    const renameWorkspace = useCallback((id: string, title: string) => {
        setWorkspaces(prev => prev.map(workspace => workspace.id === id ? { ...workspace, title } : workspace));
    }, []);

    return { workspaces, setWorkspaces, prependWorkspace, replaceWorkspace, deleteWorkspace, renameWorkspace };
}
