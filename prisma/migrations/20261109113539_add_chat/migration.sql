-- DropIndex
DROP INDEX "Chat_noteId_key";

-- DropIndex
DROP INDEX "Chat_promptId_key";

-- AlterTable
ALTER TABLE "Chat" ALTER COLUMN "noteId" DROP NOT NULL,
ALTER COLUMN "promptId" DROP NOT NULL;
