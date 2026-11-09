import prisma from "@/lib/prisma";

export const messageRepository = {
  findByThreadId(threadId: string) {
    return prisma.answer.findMany({
      where: { threadId },
      orderBy: { id: "desc" },
    });
  },
};