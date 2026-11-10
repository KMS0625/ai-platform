import { buildContext, PageContent } from "@/lib/context/buildContext";
import { chatServie } from "../chat.servie";
import { getMessages } from "../messageService";
import { pageService } from "../pageService";
import { promptService } from "../promptServie";
import type { PromptParamsDto } from "@/zrc/lib/schemas/prompt";
import type { GenerateContextAnswerDto, GenerateTextResponseDto } from "@/zrc/lib/schemas/ai";
import { dispatcher } from "./dispatcherService";

export async function contextService({ chatId, threadId, question, model }: GenerateContextAnswerDto): Promise<GenerateTextResponseDto> {
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

    const params: PromptParamsDto | undefined = prompt
    ? {
        temperature: prompt.temperature,
        topP: prompt.topP,
        maxInputTokens: prompt.maxInputTokens,
        maxOutputTokens: prompt.maxOutputTokens,
        frequencyPenalty: prompt.frequencyPenalty,
        presencePenalty: prompt.presencePenalty,
    }
    : undefined;

    const ChatMessage = buildContext({
        systemPrompt: prompt?.content,
        pages,
        history: histories,
        question,
        maxToken: prompt === null || prompt.maxInputTokens === 0 ? 8192 : prompt.maxInputTokens,
    });

    const answer = await dispatcher({ message: ChatMessage, model, config: params });

    return answer;
}
