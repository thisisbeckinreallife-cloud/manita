-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TaskMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "kind" TEXT NOT NULL DEFAULT 'TEXT',
    "content" TEXT NOT NULL,
    "payload" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "taskId" TEXT NOT NULL,
    "parentMessageId" TEXT,
    CONSTRAINT "TaskMessage_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TaskMessage_parentMessageId_fkey" FOREIGN KEY ("parentMessageId") REFERENCES "TaskMessage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TaskMessage" ("content", "createdAt", "id", "role", "taskId", "updatedAt") SELECT "content", "createdAt", "id", "role", "taskId", "updatedAt" FROM "TaskMessage";
DROP TABLE "TaskMessage";
ALTER TABLE "new_TaskMessage" RENAME TO "TaskMessage";
CREATE INDEX "TaskMessage_taskId_idx" ON "TaskMessage"("taskId");
CREATE INDEX "TaskMessage_taskId_createdAt_idx" ON "TaskMessage"("taskId", "createdAt");
CREATE INDEX "TaskMessage_parentMessageId_idx" ON "TaskMessage"("parentMessageId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
