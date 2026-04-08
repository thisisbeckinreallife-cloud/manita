import { listProjects, getProject } from "@/server/projects";
import { getTask } from "@/server/tasks";
import { listMessagesForTask } from "@/server/messages";
import { listAttachmentsForTask } from "@/server/attachments";
import { listConnectionsForOwner } from "@/server/connections";
import { getCurrentSelectionForTask } from "@/server/selections";
import { getRepositoryLinkForProject } from "@/server/repository-links";
import { getDeployTargetForProject } from "@/server/deploy-targets";
import {
  getLatestRunForProject,
  getPreviewEndpointForProject,
} from "@/server/deploy-runs";
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
  const [projects, connections] = await Promise.all([
    listProjects(),
    listConnectionsForOwner(),
  ]);
  const [
    selectedProject,
    repositoryLink,
    deployTarget,
    latestRun,
    previewEndpoint,
  ] = projectId
    ? await Promise.all([
        getProject(projectId),
        getRepositoryLinkForProject(projectId),
        getDeployTargetForProject(projectId),
        getLatestRunForProject(projectId),
        getPreviewEndpointForProject(projectId),
      ])
    : [null, null, null, null, null];
  const selectedTask = taskId ? await getTask(taskId) : null;
  const [messages, attachments, currentSelection] = taskId
    ? await Promise.all([
        listMessagesForTask(taskId),
        listAttachmentsForTask(taskId),
        getCurrentSelectionForTask(taskId),
      ])
    : [[], [], null];

  return (
    <div className="grid h-full w-full grid-cols-[64px_320px_1fr_360px] bg-ink-950">
      <FarLeftRail projects={projects} selectedId={projectId} />
      <LeftRail
        project={selectedProject}
        selectedTaskId={taskId}
        connections={connections}
      />
      <CenterPane
        project={selectedProject}
        task={selectedTask}
        messages={messages}
        attachments={attachments}
        currentSelection={currentSelection}
      />
      <RightPane
        project={selectedProject}
        repositoryLink={repositoryLink}
        deployTarget={deployTarget}
        latestRun={latestRun}
        previewEndpoint={previewEndpoint}
      />
    </div>
  );
}
