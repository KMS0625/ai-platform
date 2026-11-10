const BASE = ""

export const API = {
    chat: {
        list: `${BASE}/api/chats/`,
        detail: (id: string) => `${BASE}/api/chats/${id}`,
        threads: (id: string) => `${BASE}/api/chats/${id}/threads`,
        threadDetail: (id: string, threadId: string) => `${BASE}/api/chats/${id}/threads/${threadId}`,
    },
    note: {
        list: `${BASE}/api/note/`,
        detail: (id: string) => `${BASE}/api/notes/${id}`,
        pages: (id: string) => `${BASE}/api/notes/${id}/pages`,
    },
    // list: (query?: { take?: number; cursor?: string | null }) => {
    // const sp = new URLSearchParams()
    // if (query?.take) sp.set("take", String(query.take))
    // if (query?.cursor) sp.set("cursor", query.cursor)
    // const qs = sp.toString()
    // return qs ? `${CHATS}?${qs}` : CHATS
} as const



// import { useInfiniteQuery } from "@tanstack/react-query"
// import { API } from "@/lib/api"
// import type { ChatListResponseDto } from "@/lib/schema/chat"

// export function useChatList() {
//     return useInfiniteQuery({
//         queryKey: ["chats"],
//         initialPageParam: null as string | null,
//         queryFn: async ({ pageParam }) => {
//             const res = await fetch(API.chats.list({ cursor: pageParam }))
//             if (!res.ok) throw new Error("failed to load chats")
//             return (await res.json()) as ChatListResponseDto
//         },
//         getNextPageParam: (last) => last.nextCursor,
//     })
// }