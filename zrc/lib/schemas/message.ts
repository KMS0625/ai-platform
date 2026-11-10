import type { AnswerResponseDto } from "./answer";
import type { QuestionResponseDto } from "./question";

export type MessageDto = {
    role: "user" | "ai";
    content: string;
};

export type MessageListResponseDto = MessageDto[];

// API history keeps answer rows newest first, with each question attached.
export type MessageHistoryItemDto = AnswerResponseDto & {
    question: QuestionResponseDto;
};

export type MessageHistoryResponseDto = MessageHistoryItemDto[];
