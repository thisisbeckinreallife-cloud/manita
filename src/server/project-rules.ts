import { db } from "@/lib/db";
import { createProjectRuleInput } from "@/lib/validation/project-rule";

export type ProjectRuleRecord = {
  id: string;
  projectId: string;
  title: string;
  body: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

const SELECT_RULE = {
  id: true,
  projectId: true,
  title: true,
  body: true,
  order: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function listRulesForProject(
  projectId: string,
): Promise<ProjectRuleRecord[]> {
  return db.projectRule.findMany({
    where: { projectId },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: SELECT_RULE,
  });
}

export async function createProjectRule(
  rawInput: unknown,
): Promise<ProjectRuleRecord> {
  const input = createProjectRuleInput.parse(rawInput);
  const project = await db.project.findUnique({
    where: { id: input.projectId },
    select: { id: true },
  });
  if (!project) throw new Error("PROJECT_NOT_FOUND");

  // Append at the end of the current order sequence.
  const last = await db.projectRule.findFirst({
    where: { projectId: input.projectId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const nextOrder = (last?.order ?? -1) + 1;

  return db.projectRule.create({
    data: {
      projectId: input.projectId,
      title: input.title,
      body: input.body,
      order: nextOrder,
    },
    select: SELECT_RULE,
  });
}
