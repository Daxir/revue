/*
  Warnings:

  - The primary key for the `ReviewUnhelpfulUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `reviewUnelpfulUser_id` on the `ReviewUnhelpfulUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'NEW';

-- AlterTable
ALTER TABLE "ReviewUnhelpfulUser" DROP CONSTRAINT "ReviewUnhelpfulUser_pkey",
DROP COLUMN "reviewUnelpfulUser_id",
ADD COLUMN     "reviewUnhelpfulUser_id" SERIAL NOT NULL,
ADD CONSTRAINT "ReviewUnhelpfulUser_pkey" PRIMARY KEY ("reviewUnhelpfulUser_id");
