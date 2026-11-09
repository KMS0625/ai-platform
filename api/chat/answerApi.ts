import { toAnswer } from "@/api/mapper";
import { Answer } from "@/models/Answer";
export const AnswerApi = {
    async getAnswer(chatId: string, threadId: string, questionId: string, model: string, question: string): Promise<Answer> {
        const response =  await fetch(`/api/workspaces/chats/${chatId}/threads/${threadId}/questions/${questionId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model, question }),
        })

        if (!response.ok) {
            throw new Error(`답변 요청 실패: ${response.status}`);
        }

        const data = await response.json(); // await 필요

        return toAnswer(data);
    },
}