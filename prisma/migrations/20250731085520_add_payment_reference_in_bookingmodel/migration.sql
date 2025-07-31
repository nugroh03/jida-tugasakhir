/*
  Warnings:

  - A unique constraint covering the columns `[paymentReference]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "paymentReference" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "bookings_paymentReference_key" ON "bookings"("paymentReference");
