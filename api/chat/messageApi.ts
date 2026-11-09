import { toAnswer } from "@/api/mapper";
import { Answer } from "@/models/Answer";
export const AnswerApi = {
    async getAnswer(chatId: string, threadId: string): Promise<Answer> {
        const response =  await fetch(`/api/workspaces/chats/${chatId}/threads/${threadId}/messages`, {
            method: "GET",
        })

        if (response.status === 404) {
            throw new Error("NOT_FOUND");
        }      

        if (!response.ok) {
            throw new Error("Failed to get Thread");
        }
        
        const data = await response.json(); // await 필요

        return toAnswer(data);
    },
}