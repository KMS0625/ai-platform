/*
  Warnings:

  - You are about to drop the `Chat` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_noteId_fkey";

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_promptId_fkey";

-- DropTable
DROP TABLE "Chat";

-- CreateIndex
CREATE INDEX "ChatWorkspace_order_idx" ON "ChatWorkspace"("order");
