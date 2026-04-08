-- CreateTable
CREATE TABLE "DeployTarget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'railway',
    "railwayProjectId" TEXT NOT NULL,
    "railwayServiceId" TEXT NOT NULL,
    "railwayEnvironmentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DeployTarget_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DeployRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "targetId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "commitSha" TEXT,
    "branch" TEXT,
    "externalId" TEXT,
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observedAt" DATETIME,
    "finishedAt" DATETIME,
    "errorCode" TEXT,
    "errorDetail" TEXT,
    CONSTRAINT "DeployRun_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "DeployTarget" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DeployEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "runId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "payload" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DeployEvent_runId_fkey" FOREIGN KEY ("runId") REFERENCES "DeployRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PreviewEndpoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "targetId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "observedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastRunId" TEXT,
    CONSTRAINT "PreviewEndpoint_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "DeployTarget" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DeployTarget_projectId_key" ON "DeployTarget"("projectId");

-- CreateIndex
CREATE INDEX "DeployRun_targetId_requestedAt_idx" ON "DeployRun"("targetId", "requestedAt");

-- CreateIndex
CREATE INDEX "DeployEvent_runId_createdAt_idx" ON "DeployEvent"("runId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PreviewEndpoint_targetId_key" ON "PreviewEndpoint"("targetId");
