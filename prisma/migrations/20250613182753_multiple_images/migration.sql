/*
  Warnings:

  - You are about to drop the column `image` on the `Article` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "articleId" TEXT,
    CONSTRAINT "Image_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "category" TEXT,
    "size" TEXT,
    "color" TEXT,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "liveId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Article_liveId_fkey" FOREIGN KEY ("liveId") REFERENCES "Live" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Article" ("category", "color", "createdAt", "description", "id", "inStock", "liveId", "name", "price", "size", "updatedAt") SELECT "category", "color", "createdAt", "description", "id", "inStock", "liveId", "name", "price", "size", "updatedAt" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
