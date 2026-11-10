"use client"
import NoteWorkSpace from "@/components/noteWorkspace/NoteWorkspace";
import { SpinnerOverlay } from "@/components/Spinner/spinner";
import { useNoteWorkspaceContext } from "@/context/NotespaceContextx";

export default function notePage() {    
    const { noteWorkspace: {isWorkspaceLoading} } = useNoteWorkspaceContext();
    if (isWorkspaceLoading)
        return <SpinnerOverlay/>

    return (
        <NoteWorkSpace/>
    );
}