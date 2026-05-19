/*
  Warnings:

  - A unique constraint covering the columns `[userId,day,cycle]` on the table `Progress` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Progress_userId_day_key";

-- AlterTable
ALTER TABLE "Progress" ADD COLUMN     "cycle" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "Progress_userId_day_cycle_key" ON "Progress"("userId", "day", "cycle");
