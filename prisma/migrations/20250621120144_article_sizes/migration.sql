/*
  Warnings:

  - You are about to drop the `ArticleSize` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Size" AS ENUM ('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL');

-- DropForeignKey
ALTER TABLE "ArticleSize" DROP CONSTRAINT "ArticleSize_articleId_fkey";

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "sizes" "Size"[];

-- DropTable
DROP TABLE "ArticleSize";
