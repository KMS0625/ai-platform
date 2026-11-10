import { ChatListResponseDto } from "../schemas/chat";
import { request } from "./client";
import { API } from "./route";

export const fetchChatList = () =>
    request<ChatListResponseDto>(API.chat.list, {
        method: "GET",
    }
);

// export const fetchChat = () => 
//     request
