import { notFound } from "next/navigation";
import { Shell } from "@/components/shell/Shell";
import { getProject } from "@/server/projects";
import { getTask } from "@/server/tasks";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>;
}) {
  const { id, taskId } = await params;
  const [project, task] = await Promise.all([getProject(id), getTask(taskId)]);
  if (!project || !task) notFound();

  // Guard: the task must belong to a folder of this project.
  const folderIds = new Set(project.folders.map((folder) => folder.id));
  if (!folderIds.has(task.folderId)) notFound();

  return <Shell projectId={id} taskId={taskId} />;
}
