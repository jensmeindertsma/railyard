-- CreateTable
CREATE TABLE "Picture" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "filetype" TEXT NOT NULL,
    "bytes" BLOB NOT NULL,
    "date_taken" DATETIME NOT NULL,
    "trainId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    CONSTRAINT "Picture_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "Train" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Picture_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Picture_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Train" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "seriesName" TEXT NOT NULL,
    "versionName" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    CONSTRAINT "Train_seriesName_fkey" FOREIGN KEY ("seriesName") REFERENCES "Series" ("name") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Train_versionName_fkey" FOREIGN KEY ("versionName") REFERENCES "Version" ("name") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Train_companyName_fkey" FOREIGN KEY ("companyName") REFERENCES "Company" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Series" (
    "name" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "Version" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "seriesName" TEXT NOT NULL,
    CONSTRAINT "Version_seriesName_fkey" FOREIGN KEY ("seriesName") REFERENCES "Series" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Company" (
    "name" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "originId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    CONSTRAINT "Service_originId_fkey" FOREIGN KEY ("originId") REFERENCES "Station" ("name") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Service_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Station" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Station" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "country" TEXT NOT NULL
);
