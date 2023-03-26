-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('ADMIN', 'MODERATOR', 'USER');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('GOOGLE', 'FACEBOOK', 'EMAIL');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('THERMAL_MUG', 'DETERGENT', 'DISHWASHER_CUBE');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('NEW', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "user_type" "UserType" NOT NULL DEFAULT 'USER',
    "account_type" "AccountType" NOT NULL DEFAULT 'EMAIL',

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Product" (
    "product_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "content" JSONB NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "Review" (
    "review_id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'NEW',

    CONSTRAINT "Review_pkey" PRIMARY KEY ("review_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
