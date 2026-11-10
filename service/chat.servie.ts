import prisma from "@/lib/prisma";
import { CreateChatSchema, UpdateChatSchema } from "@/zrc/lib/schemas/chat";
import type { CreateChatDto, UpdateChatDto, ChatResponseDto, ChatWithThreadsResponseDto, ChatContextDto } from "@/zrc/lib/schemas/chat";
import type { ChatWorkspace } from "@/generated/prisma/client";

const ORDER_STEP = 10;
const DEFAULT_TITLE = "새로운 채팅";

function toChatDto(chat: ChatWorkspace): ChatResponseDto {
    return { ...chat, createdAt: chat.createdAt.toISOString() };
}

const contextSelect = { noteId: true, promptId: true } as const;

async function create(data: CreateChatDto): Promise<ChatWithThreadsResponseDto> {
    const chat = CreateChatSchema.parse(data);

    const created = await prisma.$transaction(async (tx) => {
        const { _max } = await tx.chatWorkspace.aggregate({
            _max: { order: true },
        });
        const total = await tx.chatWorkspace.count();

        return tx.chatWorkspace.create({
            data: {
                title: chat.title ?? `${DEFAULT_TITLE} ${total}`,
                order: (_max.order ?? 0) + ORDER_STEP,
                threads: {
                    create: {
                        title: chat.thread.title ?? "new thread 0",
                        model: chat.thread.model,
                    },
                },
            },
            include: { threads: true },
        });
    });
    return {
        ...toChatDto(created),
        threads: created.threads.map(thread => ({ ...thread, createdAt: thread.createdAt.toISOString() })),
    };
}

export const chatServie = {
    create,
    createWithThread(thread: CreateChatDto["thread"]) {
        return create({ thread });
    },
    async update(id: string, data: UpdateChatDto): Promise<ChatResponseDto> {
        const chat = await prisma.chatWorkspace.update({
            where: { id },
            data: UpdateChatSchema.parse(data),
        });
        return toChatDto(chat);
    },
    async findAll(): Promise<ChatResponseDto[]> {
        const chats = await prisma.chatWorkspace.findMany({
            orderBy: { order: "desc" }
        })
        return chats.map(toChatDto);
    },
    async delete(id: string): Promise<ChatResponseDto> {
        const chat = await prisma.chatWorkspace.delete({
            where: { id }
        })
        return toChatDto(chat);
    },
    async get(id: string): Promise<ChatResponseDto | null> {
        const chat = await prisma.chatWorkspace.findUnique({
            where: { id }
        })
        return chat ? toChatDto(chat) : null;
    },
    getContext(id: string): Promise<ChatContextDto | null> {
        return prisma.chatWorkspace.findUnique({
            where: { id },
            select: contextSelect,
        });
    },
    setContext(
        id: string,
        data: Pick<UpdateChatDto, "noteId" | "promptId">
    ): Promise<ChatContextDto> {
        const { noteId, promptId } = UpdateChatSchema.parse(data);
        return prisma.chatWorkspace.update({
            where: { id },
            data: { noteId, promptId },
            select: contextSelect,
        });
    },
}
