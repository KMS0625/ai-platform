"use client"

import { useState } from "react";
import { ThreadView } from "@/view-model/ThreadsWorkspace-vies";
import ThreadsEmptyState from "@/components/empty/ThreadsEmptyState";

export default function chatPage() {

    const [threads, threadsSet] = useState<ThreadView[]>([]);
    
    return (
        <ThreadsEmptyState/>
    );
}