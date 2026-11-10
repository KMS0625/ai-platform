const BASE = "/api/workspaces";

const chatDetail = (chatId: string) => `${BASE}/chats/${encodeURIComponent(chatId)}`;
const threadDetail = (chatId: string, threadId: string) =>
    `${chatDetail(chatId)}/threads/${encodeURIComponent(threadId)}`;
const noteDetail = (noteId: string) => `${BASE}/notes/${encodeURIComponent(noteId)}`;

export const API = {
    chat: {
        list: `${BASE}/chats`,
        detail: chatDetail,
        context: (chatId: string) => `${chatDetail(chatId)}/context`,
        threads: (chatId: string) => `${chatDetail(chatId)}/threads`,
        threadDetail,
        questions: (chatId: string) => `${chatDetail(chatId)}/questions`,
        answer: (chatId: string, threadId: string, questionId: string) =>
            `${threadDetail(chatId, threadId)}/questions/${encodeURIComponent(questionId)}`,
        messages: (chatId: string, threadId: string) =>
            `${threadDetail(chatId, threadId)}/messages`,
    },
    note: {
        list: `${BASE}/notes`,
        detail: noteDetail,
        pages: (noteId: string) => `${noteDetail(noteId)}/pages`,
        pageDetail: (noteId: string, pageId: string) =>
            `${noteDetail(noteId)}/pages/${encodeURIComponent(pageId)}`,
    },
    prompt: {
        list: `${BASE}/prompts`,
        detail: (promptId: string) => `${BASE}/prompts/${encodeURIComponent(promptId)}`,
    },
} as const;
