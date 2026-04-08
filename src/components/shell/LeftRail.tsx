import { CreateProjectForm } from "@/components/projects/CreateProjectForm";

type ProjectWithFolders = {
  id: string;
  name: string;
  folders: Array<{ id: string; name: string; tasks: Array<{ id: string; title: string }> }>;
} | null;

export function LeftRail({ project }: { project: ProjectWithFolders }) {
  if (!project) {
    return (
      <aside className="flex h-full flex-col border-r border-ink-800 bg-ink-900">
        <header className="flex items-center justify-between border-b border-ink-800 px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-300">
            New project
          </h2>
        </header>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <p className="mb-3 text-xs text-ink-400">
            Create a project to spin up its folders, tasks, and chat workspace.
          </p>
          <CreateProjectForm />
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
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {project.folders.length === 0 ? (
          <div className="px-3 py-2">
            <p className="text-xs text-ink-400">
              No folders yet. Folder &amp; task creation lands in the next slice.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {project.folders.map((folder) => (
              <li key={folder.id}>
                <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
                  {folder.name}
                </p>
                <ul className="flex flex-col">
                  {folder.tasks.map((task) => (
                    <li
                      key={task.id}
                      className="cursor-default rounded-md px-3 py-1.5 text-sm text-ink-200 hover:bg-ink-800"
                    >
                      {task.title}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
