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
