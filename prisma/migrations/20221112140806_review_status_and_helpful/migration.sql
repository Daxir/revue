-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('NEW', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "ReviewHelpfulUser" (
    "reviewHelpfulUser_id" SERIAL NOT NULL,
    "review_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "ReviewHelpfulUser_pkey" PRIMARY KEY ("reviewHelpfulUser_id")
);

-- CreateTable
CREATE TABLE "ReviewUnhelpfulUser" (
    "reviewUnelpfulUser_id" SERIAL NOT NULL,
    "review_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "ReviewUnhelpfulUser_pkey" PRIMARY KEY ("reviewUnelpfulUser_id")
);
