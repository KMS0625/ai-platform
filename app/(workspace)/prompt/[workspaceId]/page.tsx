"use client"

import PromptWorkspace from "@/components/promptWorkspace/PromptWorkspace";
import { SpinnerOverlay } from "@/components/Spinner/spinner";
import { usePromptWorkspaceContext } from "@/context/PromptspaceContext";

export default function notePage() {    
    const { promptWorkspace:{prompt, updatePrompt, isPromptLoading}, } = usePromptWorkspaceContext();

    if (isPromptLoading) return <SpinnerOverlay />
    else if (!prompt) return <div>프롬프트를 찾을 수 없어요.</div>;

    return (
        <PromptWorkspace
            key={prompt.id}          // ← 중요
            initial={prompt}
            onChange={updatePrompt}  // ← 연결
        />
    );
}