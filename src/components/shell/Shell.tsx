import { listProjects, getProject } from "@/server/projects";
import { getTask } from "@/server/tasks";
import { listMessagesForTask } from "@/server/messages";
import { listAttachmentsForTask } from "@/server/attachments";
import { FarLeftRail } from "./FarLeftRail";
import { LeftRail } from "./LeftRail";
import { CenterPane } from "./CenterPane";
import { RightPane } from "./RightPane";

export async function Shell({
  projectId,
  taskId,
}: {
  projectId?: string;
  taskId?: string;
}) {
  const projects = await listProjects();
  const selectedProject = projectId ? await getProject(projectId) : null;
  const selectedTask = taskId ? await getTask(taskId) : null;
  const [messages, attachments] = taskId
    ? await Promise.all([
        listMessagesForTask(taskId),
        listAttachmentsForTask(taskId),
      ])
    : [[], []];

  return (
    <div className="grid h-full w-full grid-cols-[64px_320px_1fr_360px] bg-ink-950">
      <FarLeftRail projects={projects} selectedId={projectId} />
      <LeftRail project={selectedProject} selectedTaskId={taskId} />
      <CenterPane
        project={selectedProject}
        task={selectedTask}
        messages={messages}
        attachments={attachments}
      />
      <RightPane project={selectedProject} />
    </div>
  );
}
