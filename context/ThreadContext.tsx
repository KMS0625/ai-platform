"use client";

import { createContext, useContext, type ReactNode } from "react";
import {useThread} from "@/hooks/useThread";

type ThreadContextType = ReturnType<typeof useThread>;

const ThreadContext = createContext<ThreadContextType | null>(null);

export function ThreadProvider({ children }: { children: ReactNode }) {
    const thread = useThread(); // 여기서 한 번만 호출

    return (
        <ThreadContext.Provider value={thread}>
            {children}
        </ThreadContext.Provider>
    );
}

export function useThreadContext() {
    const ctx = useContext(ThreadContext);
    if (!ctx) throw new Error("ThreadProvider 안에서 사용해야 해요");
    return ctx;
}