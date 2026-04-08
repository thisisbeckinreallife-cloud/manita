import Link from "next/link";
import { CreateProjectForm } from "@/components/projects/CreateProjectForm";
import { CreateFolderForm } from "@/components/folders/CreateFolderForm";
import { CreateTaskForm } from "@/components/tasks/CreateTaskForm";
import { CreateConnectionForm } from "@/components/providers/CreateConnectionForm";
import { ConnectionList } from "@/components/providers/ConnectionList";
import type { ConnectionRecord } from "@/server/connections";

type FolderWithTasks = {
  id: string;
  name: string;
  tasks: Array<{ id: string; title: string; status: string }>;
};

type ProjectWithFolders = {
  id: string;
  name: string;
  folders: FolderWithTasks[];
} | null;

export function LeftRail({
  project,
  selectedTaskId,
  connections,
}: {
  project: ProjectWithFolders;
  selectedTaskId?: string;
  connections: ConnectionRecord[];
}) {
  if (!project) {
    return (
      <aside className="flex h-full flex-col border-r border-ink-800 bg-ink-900">
        <header className="flex items-center justify-between border-b border-ink-800 px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-300">
            New project
          </h2>
        </header>
        <div className="flex-1 overflow-y-auto">
          <section className="border-b border-ink-800 px-4 py-4">
            <p className="mb-3 text-xs text-ink-400">
              Create a project to spin up its folders, tasks, and chat workspace.
            </p>
            <CreateProjectForm />
          </section>
          <section className="px-4 py-4">
            <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
              Provider connections
            </h3>
            <CreateConnectionForm />
            <div className="mt-4">
              <ConnectionList connections={connections} />
            </div>
          </section>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-full flex-col border-r border-ink-800 bg-ink-900">
      <header className="flex items-center justify-between border-b border-ink-800 px-4 py-3">
        <h2 className="truncate text-xs font-semibold uppercase tracking-wider text-ink-300">
          {project.name}
        </h2>
      </header>

      <div className="border-b border-ink-800 px-4 py-3">
        <CreateFolderForm projectId={project.id} />
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        {project.folders.length === 0 ? (
          <p className="px-3 py-2 text-xs text-ink-400">
            No folders yet. Create one above to start adding tasks.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {project.folders.map((folder) => (
              <li key={folder.id}>
                <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
                  {folder.name}
                </p>
                <ul className="flex flex-col">
                  {folder.tasks.map((task) => {
                    const active = task.id === selectedTaskId;
                    return (
                      <li key={task.id}>
                        <Link
                          href={`/projects/${project.id}/tasks/${task.id}`}
                          className={`flex items-center justify-between rounded-md px-3 py-1.5 text-sm transition ${
                            active
                              ? "bg-accent/15 text-ink-100"
                              : "text-ink-200 hover:bg-ink-800"
                          }`}
                        >
                          <span className="truncate">{task.title}</span>
                          <StatusDot status={task.status} />
                        </Link>
                      </li>
                    );
                  })}
                  <li className="pt-0.5">
                    <CreateTaskForm folderId={folder.id} />
                  </li>
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === "DONE"
      ? "bg-ok"
      : status === "IN_PROGRESS"
        ? "bg-warn"
        : status === "ARCHIVED"
          ? "bg-ink-500"
          : "bg-ink-400";
  return <span className={`ml-2 h-1.5 w-1.5 shrink-0 rounded-full ${color}`} />;
}
