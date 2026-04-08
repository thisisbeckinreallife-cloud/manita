import type { TaskRecord } from "@/server/tasks";
import type { MessageRecord } from "@/server/messages";
import { ChatThread } from "@/components/chat/ChatThread";
import { ChatComposer } from "@/components/chat/ChatComposer";

type ProjectHeader = { id: string; name: string; description: string | null } | null;

export function CenterPane({
  project,
  task,
  messages,
}: {
  project: ProjectHeader;
  task: TaskRecord | null;
  messages: MessageRecord[];
}) {
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

  if (!task) {
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
            Create a folder and a task in the left rail, then click it to open the workspace.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-full flex-col bg-ink-950">
      <header className="flex items-start justify-between gap-4 border-b border-ink-800 px-6 py-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-ink-400">{project.name}</p>
          <h1 className="mt-1 truncate text-base font-semibold text-ink-100">{task.title}</h1>
          {task.description ? (
            <p className="mt-1 max-w-xl text-xs text-ink-400">{task.description}</p>
          ) : null}
        </div>
        <StatusBadge status={task.status} />
      </header>
      <ChatThread messages={messages} />
      <ChatComposer taskId={task.id} />
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const palette: Record<string, string> = {
    OPEN: "bg-ink-800 text-ink-200",
    IN_PROGRESS: "bg-warn/15 text-warn",
    DONE: "bg-ok/15 text-ok",
    ARCHIVED: "bg-ink-800 text-ink-400",
  };
  const cls = palette[status] ?? "bg-ink-800 text-ink-200";
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cls}`}
    >
      {status.replace("_", " ").toLowerCase()}
    </span>
  );
}
