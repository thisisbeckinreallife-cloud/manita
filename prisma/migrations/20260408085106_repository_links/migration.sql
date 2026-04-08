-- CreateTable
CREATE TABLE "RepositoryLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'github',
    "requestedOwner" TEXT NOT NULL,
    "requestedName" TEXT NOT NULL,
    "requestedPrivate" BOOLEAN NOT NULL DEFAULT true,
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observedOwner" TEXT,
    "observedName" TEXT,
    "observedUrl" TEXT,
    "observedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "errorCode" TEXT,
    "errorDetail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RepositoryLink_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "RepositoryLink_projectId_key" ON "RepositoryLink"("projectId");
