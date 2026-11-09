export type Question = {
    id: string;
    workspaceId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export type QuestionCreateData = {
    content: string;
}