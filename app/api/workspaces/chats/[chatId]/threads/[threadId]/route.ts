import { handler, noContent } from "@/lib/server/http";
import { threadService } from "@/service/thread.servie";

export const DELETE = handler<{ chatId: string; threadId: string }>(async (_request, { params }) => {
    const { chatId, threadId } = await params;
    await threadService.delete(chatId, threadId);
    return noContent();
});
