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
  renameWorkspace: (id: string, title: string) => Promise<void>;
};


function useChatSideData(): SideData {
  const { workspaceList: { workspaces }, chatWorkspace: { deleteWorkspace, renameWorkspace } } = useChatWorkspaceContext();
  return { workspaces, deleteWorkspace, renameWorkspace };
}

function useNoteSideData(): SideData {
  const { workspaceList: { workspaces }, noteWorkspace: { deleteWorkspace, renameWorkspace } } = useNoteWorkspaceContext();
  return { workspaces, deleteWorkspace, renameWorkspace };
}

function usePromptSideData(): SideData {
  const { workspaceList: { workspaces }, promptWorkspace: { deleteWorkspace, renameWorkspace } } = usePromptWorkspaceContext();
  return { workspaces, deleteWorkspace, renameWorkspace };
}


function SideContainerInner({
  section,
  workspaces,
  deleteWorkspace,
  renameWorkspace,
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
      onRename={renameWorkspace}
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
