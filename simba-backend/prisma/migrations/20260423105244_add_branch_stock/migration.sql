/*
  Warnings:

  - You are about to drop the `VendorProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'ASSIGNED';
ALTER TYPE "OrderStatus" ADD VALUE 'PREPARING';
ALTER TYPE "OrderStatus" ADD VALUE 'READY_FOR_PICKUP';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'BRANCH_MANAGER';
ALTER TYPE "Role" ADD VALUE 'BRANCH_STAFF';

-- DropForeignKey
ALTER TABLE "VendorProfile" DROP CONSTRAINT "VendorProfile_userId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "assignedBy" TEXT,
ADD COLUMN     "assignedTo" TEXT,
ADD COLUMN     "branchName" TEXT,
ADD COLUMN     "depositAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "depositPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "momoReference" TEXT,
ADD COLUMN     "pickupTime" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "branch" TEXT;

-- DropTable
DROP TABLE "VendorProfile";

-- DropEnum
DROP TYPE "VendorStatus";

-- CreateTable
CREATE TABLE "BranchStock" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "branchName" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BranchStock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BranchStock_productId_branchName_key" ON "BranchStock"("productId", "branchName");

-- AddForeignKey
ALTER TABLE "BranchStock" ADD CONSTRAINT "BranchStock_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
