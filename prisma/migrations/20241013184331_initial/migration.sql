-- CreateTable
CREATE TABLE "Picture" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "data" BLOB NOT NULL,
    "date_taken" DATETIME NOT NULL
);
