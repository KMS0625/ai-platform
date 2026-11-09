import { Suspense, type ReactNode } from "react";
import SideContainer from "@/components/side/SideContainer";
import { ChatWorkspaceProvider } from "@/context/ChatspaceContext";
import type { Section } from "@/constants/section";
import styles from "@/app/(workspace)/layout.module.css";
import { NoteWorkspaceProvider } from "@/context/NotespaceContextx";
import { PromptWorkspaceProvider } from "@/context/PromptspaceContext";

export default function WorkspaceShell({
    section,
    children,
}: {
    section: Section;
    children: ReactNode;
}) {
    const content = (
        <div className={styles.app}>
            <aside className={styles.side}>
                <SideContainer section={section}/>
            </aside>
            <div className={styles.main}>
                {children}
            </div>
        </div>
    );
    switch (section) {
        case "chat":
            return (
                <Suspense fallback={null}>
                    <ChatWorkspaceProvider>
                        {content}
                    </ChatWorkspaceProvider>
                </Suspense>
            );
        case "note":
            return (
                <Suspense fallback={null}>
                    <NoteWorkspaceProvider>
                        {content}
                    </NoteWorkspaceProvider>
                </Suspense>
            );
        case "prompt":
            return (
                <Suspense fallback={null}>
                    <PromptWorkspaceProvider>
                        {content}
                    </PromptWorkspaceProvider>
                </Suspense>
            );
    }
}