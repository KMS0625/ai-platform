"use client";

import { useParams, useRouter } from "next/navigation";
import Side from "./Side";
import { getSideConfig, collectionPath, sectionPath, type Section } from "@/constants/section";

import { useChatWorkspaceContext } from "@/context/ChatspaceContext";
import { useNoteWorkspaceContext } from "@/context/NotespaceContextx";
import { Workspace } from "@/models/Workspace";
import { usePromptWorkspaceContext } from "@/context/PromptspaceContext";

type SideData = {
  workspaces: Workspace[];
  deleteWorkspace: (id: string) => void;
};


function useChatSideData(): SideData {
  const { workspaceList: { workspaces }, chatWorkspace: { deleteWorkspace } } = useChatWorkspaceContext();
  return { workspaces, deleteWorkspace };
}

function useNoteSideData(): SideData {
  const { workspaceList: { workspaces }, noteWorkspace: { deleteWorkspace } } = useNoteWorkspaceContext();
  return { workspaces, deleteWorkspace };
}

function usePromptSideData(): SideData {
  const { workspaceList: { workspaces }, promptWorkspace: { deleteWorkspace } } = usePromptWorkspaceContext();
  return { workspaces, deleteWorkspace };
}


function SideContainerInner({
  section,
  workspaces,
  deleteWorkspace,
}: { section: Section } & SideData) {
  const router = useRouter();
  const { workspaceId } = useParams<{ workspaceId?: string }>();
  const { buttonLabel, label } = getSideConfig(section);

  const handleDelete = async (id: string) => {
    await deleteWorkspace(id);

    if (id === workspaceId) {
      router.push(sectionPath(section))
    }
  };

  return (
    <Side
      Workspaces={workspaces}
      selectedId={workspaceId}
      onCreate={() => router.push(sectionPath(section))}
      onSelect={(id) => router.push(collectionPath(section, id))}
      onDelete={handleDelete}
      newButtonContent={buttonLabel}
      title={label}
    />
  );
}

function ChatSide({ section }: { section: Section }) {
  const data = useChatSideData();
  return <SideContainerInner section={section} {...data} />;
}

function NoteSide({ section }: { section: Section }) {
  const data = useNoteSideData();
  return <SideContainerInner section={section} {...data} />;
}

function PromptSide({ section }: { section: Section }) {
  const data = usePromptSideData();
  return <SideContainerInner section={section} {...data} />;
}



export default function SideContainer({ section }: { section: Section }) {
  if (section === "chat") return <ChatSide section={section} />;
  if (section === "note") return <NoteSide section={section} />;
  if (section === "prompt") return <PromptSide section={section} />;
  return null;
}