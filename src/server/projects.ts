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
