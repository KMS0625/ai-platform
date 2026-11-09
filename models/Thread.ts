
export type Thread = {
    id: string;
    workspaceId: string;
    title: string;
    model: string;
    createdAt: Date;
    updatedAt: Date;
    order: number;
}

export type ThreadCreateData = {
    model: string;
}