import { db } from "@/lib/db";
import { createProjectInput, type CreateProjectInput } from "@/lib/validation/project";
import { getOrCreateDefaultUser } from "./users";

export type ProjectListItem = {
  id: string;
  name: string;
  description: string | null;
  updatedAt: Date;
};

export async function listProjects(): Promise<ProjectListItem[]> {
  const owner = await getOrCreateDefaultUser();
  return db.project.findMany({
    where: { ownerId: owner.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, description: true, updatedAt: true },
  });
}

/**
 * Returns the project with ALL of its folders (and each folder's tasks)
 * embedded. The `folders` include must remain unfiltered: the route guard at
 * `src/app/projects/[id]/tasks/[taskId]/page.tsx` derives the set of valid
 * folder IDs from this result and 404s tasks whose folder is missing. Adding
 * a `where` or `take` here will silently turn legitimate tasks into 404s.
 */
export async function getProject(id: string) {
  return db.project.findUnique({
    where: { id },
    include: {
      folders: {
        orderBy: { updatedAt: "desc" },
        include: { tasks: { orderBy: { updatedAt: "desc" } } },
      },
    },
  });
}

export async function createProject(rawInput: unknown) {
  const input: CreateProjectInput = createProjectInput.parse(rawInput);
  const owner = await getOrCreateDefaultUser();
  return db.project.create({
    data: {
      name: input.name,
      description: input.description,
      ownerId: owner.id,
    },
    select: { id: true, name: true, description: true, updatedAt: true },
  });
}
