import z from "zod";

export const CreateQuestionSchema = z.object({
    content: z.string().min(1),
});

export type CreateQuestionDto = z.infer<typeof CreateQuestionSchema>;

export type QuestionResponseDto = {
    id: string;
    workspaceId: string;
    content: string;
    createdAt: string;
};
