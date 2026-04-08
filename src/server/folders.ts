import { db } from "@/lib/db";
import { createFolderInput } from "@/lib/validation/folder";

export async function listFoldersForProject(projectId: string) {
  return db.folder.findMany({
    where: { projectId },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, projectId: true, updatedAt: true },
  });
}

export async function getFolder(id: string) {
  return db.folder.findUnique({
    where: { id },
    include: { tasks: { orderBy: { updatedAt: "desc" } } },
  });
}

export async function createFolder(rawInput: unknown) {
  const input = createFolderInput.parse(rawInput);
  const project = await db.project.findUnique({
    where: { id: input.projectId },
    select: { id: true },
  });
  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }
  return db.folder.create({
    data: { name: input.name, projectId: input.projectId },
    select: { id: true, name: true, projectId: true, updatedAt: true },
  });
}
