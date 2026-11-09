/*
  Warnings:

  - You are about to drop the column `label` on the `Thread` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `Thread` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChatWorkspace" ALTER COLUMN "order" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Thread" DROP COLUMN "label",
DROP COLUMN "provider",
ALTER COLUMN "order" SET DEFAULT 0;
