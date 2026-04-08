import { db } from "@/lib/db";
import { createProjectContextInput } from "@/lib/validation/project-context";

export type ProjectContextRecord = {
  id: string;
  projectId: string;
  label: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

const SELECT_CONTEXT = {
  id: true,
  projectId: true,
  label: true,
  content: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function listContextsForProject(
  projectId: string,
): Promise<ProjectContextRecord[]> {
  return db.projectContext.findMany({
    where: { projectId },
    orderBy: { updatedAt: "desc" },
    select: SELECT_CONTEXT,
  });
}

export async function createProjectContext(
  rawInput: unknown,
): Promise<ProjectContextRecord> {
  const input = createProjectContextInput.parse(rawInput);
  const project = await db.project.findUnique({
    where: { id: input.projectId },
    select: { id: true },
  });
  if (!project) throw new Error("PROJECT_NOT_FOUND");
  return db.projectContext.create({
    data: {
      projectId: input.projectId,
      label: input.label,
      content: input.content,
    },
    select: SELECT_CONTEXT,
  });
}
