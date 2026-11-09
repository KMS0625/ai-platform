-- AlterTable
ALTER TABLE "ChatWorkspace" ADD COLUMN     "noteId" TEXT,
ADD COLUMN     "promptId" TEXT;

-- AddForeignKey
ALTER TABLE "ChatWorkspace" ADD CONSTRAINT "ChatWorkspace_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatWorkspace" ADD CONSTRAINT "ChatWorkspace_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
