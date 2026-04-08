import { db } from "@/lib/db";
import { createProjectSkillReferenceInput } from "@/lib/validation/project-skill-reference";

export type ProjectSkillReferenceRecord = {
  id: string;
  projectId: string;
  name: string;
  source: string | null;
  createdAt: Date;
};

const SELECT_SKILL = {
  id: true,
  projectId: true,
  name: true,
  source: true,
  createdAt: true,
} as const;

export async function listSkillReferencesForProject(
  projectId: string,
): Promise<ProjectSkillReferenceRecord[]> {
  return db.projectSkillReference.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    select: SELECT_SKILL,
  });
}

export async function createProjectSkillReference(
  rawInput: unknown,
): Promise<ProjectSkillReferenceRecord> {
  const input = createProjectSkillReferenceInput.parse(rawInput);
  const project = await db.project.findUnique({
    where: { id: input.projectId },
    select: { id: true },
  });
  if (!project) throw new Error("PROJECT_NOT_FOUND");
  return db.projectSkillReference.create({
    data: {
      projectId: input.projectId,
      name: input.name,
      source: input.source ?? null,
    },
    select: SELECT_SKILL,
  });
}
