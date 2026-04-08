type ProjectHeader = { id: string; name: string; description: string | null } | null;

export function CenterPane({ project }: { project: ProjectHeader }) {
  if (!project) {
    return (
      <main className="flex h-full flex-col bg-ink-950">
        <header className="flex items-center justify-between border-b border-ink-800 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-400">Workspace</p>
            <h1 className="mt-1 text-base font-semibold text-ink-100">No project selected</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <p className="text-sm text-ink-300">Create or pick a project to start working.</p>
          <p className="mt-1 text-xs text-ink-400">
            Chat, attachments, model selection, and run controls live here once a task is open.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-full flex-col bg-ink-950">
      <header className="flex items-start justify-between border-b border-ink-800 px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-ink-400">Project</p>
          <h1 className="mt-1 text-base font-semibold text-ink-100">{project.name}</h1>
          {project.description ? (
            <p className="mt-1 max-w-xl text-xs text-ink-400">{project.description}</p>
          ) : null}
        </div>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <p className="text-sm text-ink-300">No task selected.</p>
        <p className="mt-1 text-xs text-ink-400">
          Folders, tasks, chat, attachments, and model controls land in slice 0c+.
        </p>
      </div>
    </main>
  );
}
