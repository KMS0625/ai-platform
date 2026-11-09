export type Page = {
    id : string;
    noteId: string;
    title: string;
    keywords: string[];
    content: string;
    priority: number;
    importance: number;
    enabled: boolean;
    order: number;
}

export type PageUpdateData = {
    title?: string;
    enabled?: boolean;
    keywords?: string[];
    priority?: number;
    importance?: number;
    content?: string;
    order?: number;
};