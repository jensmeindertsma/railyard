/*
  Warnings:

  - You are about to drop the column `date_taken` on the `Picture` table. All the data in the column will be lost.
  - Added the required column `date` to the `Picture` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Picture" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL
);
INSERT INTO "new_Picture" ("id") SELECT "id" FROM "Picture";
DROP TABLE "Picture";
ALTER TABLE "new_Picture" RENAME TO "Picture";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
