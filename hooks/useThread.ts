import { Thread } from "@/models/Thread";
import { useCallback, useEffect, useState } from "react";

export function useThread() {
    const [threads, setThreads] = useState<Thread[]>([]);

    const appendThread = useCallback((thread: Thread) => {
        setThreads((prev) => [...prev, thread])
    },[]);

    const replaceThreads = useCallback((next: Thread[]) => {
        setThreads(next);
    }, []);

    const clearThreads = useCallback(() => {
        setThreads([]);
    }, []);


    return { threads, setThreads, appendThread, replaceThreads, clearThreads }
}