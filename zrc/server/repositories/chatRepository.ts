import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { CreateChatDto } from "@/zrc/lib/schemas/chat";
import { CreateThreadDto } from "@/zrc/lib/schemas/thread";

export const chatRepository = {

    // create: (data: { title?: string }) => {
    //     return prisma.chat.create({
    //         data: {
    //             title: data.title,
    //             threads: {
    //                 create: {},   // 스레드 1개를 같이 생성
    //             },
    //         },
    //         include: { threads: true },
    //     })
    // },
    create: (chat: CreateChatDto, count: number = 0) => {
        return prisma.chatWorkspace.create({
            data: {
                title: chat.title ?? `새로운 채팅 ${count}`,
                threads: {
                    create: {
                        title: chat.thread.title ?? `new thread ${0}`,
                        model: chat.thread.model,
                    }
                },
            }, include: {
                threads: true,
            }
        })
    },
    count: (where?: Prisma.ChatWorkspaceWhereInput) => {
        return prisma.chatWorkspace.count({
            where,
        })
    },
    getAll: () => {
        return prisma.chatWorkspace.findMany({
            select: { 
                id: true, 
                title: true,
                createdAt: true,
                promptId: true,
                noteId: true,
            },
            orderBy: [{ order: "desc" }]
        })
    },
    // getAll: ({ take, cursor }: ChatListQuery) => {
    //     return prisma.chat.findMany({
    //         take: take + 1,
    //         ...(cursor && {
    //             cursor: { id: cursor },
    //             skip: 1,
    //         }),
    //         select: { id: true, title: true },
    //         orderBy: [{ order: "asc" }]
    //     })
    // },
    getRelationIds: (id: string) => {
        return prisma.chatWorkspace.findUnique({
            where: { id },
            select: {
                promptId: true,
                noteId: true,
            },
        });
    },
    getRelations: (id: string) => {
        return prisma.chatWorkspace.findUnique({
            where: { id },
            select: {
                prompt: true,
                note: true,
            },
        });
    },
    update: (id: string, data: Prisma.ChatWorkspaceUpdateInput) => {
        return prisma.chatWorkspace.update({
            where: { id },
            data,
        });
    },
}