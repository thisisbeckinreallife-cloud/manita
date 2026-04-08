-- CreateTable
CREATE TABLE "ModelProviderConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "ModelProviderConnection_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ModelSelectionSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "takenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "taskId" TEXT NOT NULL,
    "connectionId" TEXT,
    CONSTRAINT "ModelSelectionSnapshot_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ModelSelectionSnapshot_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "ModelProviderConnection" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ModelProviderConnection_ownerId_idx" ON "ModelProviderConnection"("ownerId");

-- CreateIndex
CREATE INDEX "ModelSelectionSnapshot_taskId_takenAt_idx" ON "ModelSelectionSnapshot"("taskId", "takenAt");
