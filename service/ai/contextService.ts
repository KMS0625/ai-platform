import { buildContext, PageContent } from "@/lib/context/buildContext";
import { chatServie } from "../chat.servie";
import { getMessages } from "../messageService";
import { pageService } from "../pageService";
import { promptService } from "../promptServie";

export async function contextService(
    chatId: string,
    threadId: string,
    question: string
) {
    const histories = await getMessages(threadId);
    const context = await chatServie.getContext(chatId);

    const pages: PageContent[] = context?.noteId
    ? (await pageService.findMatchedPages(context.noteId, question)).map((page) => ({
        priority: page.priority,
        importance: page.importance,
        content: page.content,
    }))
    : []; 

    const prompt = context?.promptId
        ? await promptService.get(context.promptId)
        : null;

    const ChatMessage = buildContext({
        systemPrompt: prompt?.content,
        pages,
        history: histories,
        question,
        maxToken: prompt === null || prompt.maxInputTokens === 0 ? 8192 : prompt.maxInputTokens,
    });

    return ChatMessage;
}