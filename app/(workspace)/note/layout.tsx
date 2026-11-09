// app/(workspace)/chat/layout.tsx
import type { ReactNode } from "react";
import WorkspaceShell from "@/components/workspaceShell/WorkspaceShell";

export default function Layout({ children }: { children: ReactNode }) {
    return <WorkspaceShell section="note">{children}</WorkspaceShell>;
}