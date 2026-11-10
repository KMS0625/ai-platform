import "server-only"
import { chatRepository } from "@/zrc/server/repositories/chatRepository";
import type { ChatListResponseDto, ChatResponseDto, CreateChatDto } from "@/zrc/lib/schemas/chat";

// async function getChatList(query: ChatListQuery): Promise<ChatListResponseDto> {
//     const rows = await chatRepository.getAll(query);

//     const hasMore = rows.length > query.take;
//     const items = hasMore ? rows.slice(0, query.take) : rows;

//     return {
//         items,
//         nextCursor: hasMore ? items[items.length - 1].id : null,
//     };
// };

async function getChatList(): Promise<ChatListResponseDto> {
    const items = await chatRepository.getAll();

    return {
        items: items.map(item => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
        })),
    };
};

// async function createChat(data: CreateChatDto): Promise<ChatResponseDto> {
//     const created = await chatRepository.create(data, 0);

//     return 
// }

async function getContext(id: string) {
    
}

export const chatService = {
    getChatList,
};