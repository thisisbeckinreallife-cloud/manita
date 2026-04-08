import { listProjects, getProject } from "@/server/projects";
import { FarLeftRail } from "./FarLeftRail";
import { LeftRail } from "./LeftRail";
import { CenterPane } from "./CenterPane";
import { RightPane } from "./RightPane";

export async function Shell({ projectId }: { projectId?: string }) {
  const projects = await listProjects();
  const selectedProject = projectId ? await getProject(projectId) : null;

  return (
    <div className="grid h-full w-full grid-cols-[64px_320px_1fr_360px] bg-ink-950">
      <FarLeftRail projects={projects} selectedId={projectId} />
      <LeftRail project={selectedProject} />
      <CenterPane project={selectedProject} />
      <RightPane project={selectedProject} />
    </div>
  );
}
