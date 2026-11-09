export type Workspace = {
    id: string;
    title: string;
    createdAt: Date;
    order: number;
    noteId: string | null;
    promptId: string | null;
}

export type ChatCreateData = {
    title: string;
}