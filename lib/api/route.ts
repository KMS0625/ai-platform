const BASE = ""

export const API = {
    chat: {
        list: `${BASE}/api/chat/`,
        detail: (id: string) => `${BASE}/api/chats/${id}`,
        threads: (id: string) => `${BASE}/api/chats/${id}/threads`,
        threadDetail: (id: string, threadId: string) => `${BASE}/api/chats/${id}/threads/${threadId}`,
    },
    note: {
        list: `${BASE}/api/note/`,
        detail: (id: string) => `${BASE}/api/notes/${id}`,
        pages: (id: string) => `${BASE}/api/notes/${id}/pages`,
    }
} as const