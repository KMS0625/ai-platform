import { Answer } from "@/models/Answer";
import { Message } from "@/models/Message";
import { Page } from "@/models/Page";
import { Question } from "@/models/Question";
import { Thread } from "@/models/Thread";
import { Workspace } from "@/models/Workspace";
import { ThreadMessage } from "@/types/ThreadMessage";
import { MessageView } from "@/view-model/ThreadsWorkspace-vies";

export function toWorkspace(d: any): Workspace {
    return {
        id: d.id,
        title: d.title,
        order: d.order,
        createdAt: new Date(d.createdAt),
        promptId: d.promptId ?? null,
        noteId: d.noteId ?? null,
    }
} 

export function toThread(d: any): Thread {
    return {
        id: d.id,
        workspaceId: d.workspaceId,
        title: d.title,
        model: d.model,
        order: d.order,
        createdAt: new Date(d.createdAt),
        updatedAt: new Date(d.updatedAt),
    }
}

export function toQuestion(d: any): Question {
    return {
        id: d.id,
        workspaceId: d.workspaceId,
        content: d.content,
        createdAt: new Date(d.createdAt),
        updatedAt: new Date(d.updatedAt),
    }
}

export function toAnswer(d: any): Answer {
    return {
        id: d.id,
        threadId: d.threadId,
        questionId: d.questionId,
        content: d.content,
        createdAt: new Date(d.createdAt),
        updatedAt: new Date(d.createdAt),
        order: d.id,
        status: "completed",
    }
}

export const toMessageViews = (rows: any[]): MessageView[] =>
    rows.flatMap((row): MessageView[] => [
        ...(row.question
            ? [{ type: "question" as const, data: toQuestion(row.question) }]
            : []),
        { type: "answer" as const, data: toAnswer(row) },
    ]);

export function toPage(d: any): Page {
    return {
        id: d.id,
        noteId: d.noteId,
        title: d.title,
        content: d.content,
        keywords: d.keywords,
        priority: d.priority,
        importance: d.importance,
        enabled: d.enabled,
        order: d.order,
    }
}