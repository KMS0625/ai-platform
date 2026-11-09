import { toQuestion, toThread } from "@/api/mapper";
import { Question, QuestionCreateData } from "@/models/Question";

export const questionApi = {
    async create(chatId: string, question: QuestionCreateData): Promise<Question> {
        const response = await fetch(`/api/workspaces/chats/${chatId}/questions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question })
        })

        if (!response.ok) {
            throw new Error("Faild to create question");
        }

        const data = await response.json();

        return toQuestion(data);
    },
}