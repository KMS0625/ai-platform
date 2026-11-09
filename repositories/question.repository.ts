import prisma from "@/lib/prisma";

export const questionRepository = {
  findByWorkspaceId(workspaceId: string) {
    return prisma.question.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "asc" },
    });
  },
};