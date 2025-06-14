-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ArticleSize" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articleId" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    CONSTRAINT "ArticleSize_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ArticleSize" ("articleId", "id", "size") SELECT "articleId", "id", "size" FROM "ArticleSize";
DROP TABLE "ArticleSize";
ALTER TABLE "new_ArticleSize" RENAME TO "ArticleSize";
CREATE TABLE "new_Image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "articleId" TEXT,
    CONSTRAINT "Image_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Image" ("articleId", "id", "public_id", "url") SELECT "articleId", "id", "public_id", "url" FROM "Image";
DROP TABLE "Image";
ALTER TABLE "new_Image" RENAME TO "Image";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
