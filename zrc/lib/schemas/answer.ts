import z from "zod";

export const CreateAnswerSchema = z.object({
    content: z.string(),
    status: z.enum(["completed", "failed"]).default("completed"),
});

export const GenerateAnswerSchema = z.object({
    model: z.string(),
    question: z.string(),
});

export type CreateAnswerDto = z.infer<typeof CreateAnswerSchema>;
export type GenerateAnswerDto = z.infer<typeof GenerateAnswerSchema>;

export type AnswerResponseDto = {
    id: number;
    threadId: string;
    questionId: string;
    content: string | null;
    status: "COMPLETED" | "FAILED";
    createdAt: string;
    updatedAt: string;
};

export type AnswerWithQuestionContentDto = {
    content: string | null;
    question: { content: string };
};
