/*
  Warnings:

  - A unique constraint covering the columns `[orderId]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.
  - The required column `orderId` was added to the `bookings` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "orderId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "bookings_orderId_key" ON "bookings"("orderId");
