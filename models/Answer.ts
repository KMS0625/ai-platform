import { AnswerStatus } from "@/types/AnswerStatus";

export type Answer = {
    id: number;
    threadId: string;
    questionId: string | null;
    content: string;
    order: number;
    status: AnswerStatus;
    createdAt: Date;
    updatedAt: Date;
}

export type AnswerCreateData = {
    content: string;
    status: AnswerStatus;
}