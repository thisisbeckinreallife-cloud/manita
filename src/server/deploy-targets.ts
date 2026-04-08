import { db } from "@/lib/db";
import { linkDeployTargetInput } from "@/lib/validation/deploy-target";

export type DeployTargetRecord = {
  id: string;
  projectId: string;
  provider: string;
  railwayProjectId: string;
  railwayServiceId: string;
  railwayEnvironmentId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const SELECT_TARGET = {
  id: true,
  projectId: true,
  provider: true,
  railwayProjectId: true,
  railwayServiceId: true,
  railwayEnvironmentId: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function getDeployTargetForProject(
  projectId: string,
): Promise<DeployTargetRecord | null> {
  return db.deployTarget.findUnique({
    where: { projectId },
    select: SELECT_TARGET,
  });
}

export async function linkDeployTarget(
  rawInput: unknown,
): Promise<DeployTargetRecord> {
  const input = linkDeployTargetInput.parse(rawInput);

  const project = await db.project.findUnique({
    where: { id: input.projectId },
    select: { id: true },
  });
  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  return db.deployTarget.upsert({
    where: { projectId: input.projectId },
    create: {
      projectId: input.projectId,
      provider: "railway",
      railwayProjectId: input.railwayProjectId,
      railwayServiceId: input.railwayServiceId,
      railwayEnvironmentId: input.railwayEnvironmentId ?? null,
    },
    update: {
      railwayProjectId: input.railwayProjectId,
      railwayServiceId: input.railwayServiceId,
      railwayEnvironmentId: input.railwayEnvironmentId ?? null,
    },
    select: SELECT_TARGET,
  });
}
