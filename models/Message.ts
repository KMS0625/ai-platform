import { AnswerStatus } from "@/types/AnswerStatus";

export type Message = {
    id: number;
    threadId: string;
    questionId: string | null;
    answer?: string;
    order: number;
    status: AnswerStatus;
    createdAt: Date;
    updatedAt: Date;
}