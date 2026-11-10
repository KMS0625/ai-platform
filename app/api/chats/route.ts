import { ChatListResponseDto } from "@/zrc/lib/schemas/chat";
import { chatService } from "@/zrc/server/services/chatService";

import { handler, ok } from "@/zrc/lib/server/http";

export const GET = handler(async () => {
    const chats: ChatListResponseDto = await chatService.getChatList()
    return ok(chats)
})