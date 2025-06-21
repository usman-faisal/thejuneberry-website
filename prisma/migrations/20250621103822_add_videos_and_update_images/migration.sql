/*
  Warnings:

  - You are about to drop the `Image` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_articleId_fkey";

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "images" TEXT[],
ADD COLUMN     "videos" TEXT[];

-- DropTable
DROP TABLE "Image";
