import type { TaskRunRecord } from "@/server/task-runs";

export function TaskRunList({ runs }: { runs: TaskRunRecord[] }) {
  if (runs.length === 0) {
    return <p className="text-[11px] text-ink-500">No runs yet.</p>;
  }
  return (
    <ul className="flex flex-col gap-1.5">
      {runs.map((run) => (
        <li
          key={run.id}
          className="flex flex-col gap-1 rounded-md border border-ink-800 bg-ink-950 px-2.5 py-1.5"
        >
          <div className="flex items-center justify-between gap-2">
            <StatusPill status={run.status} />
            <time
              className="text-[10px] text-ink-500"
              dateTime={run.requestedAt.toISOString()}
            >
              {run.requestedAt.toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          </div>
          <p className="text-[11px] text-ink-400">
            {run.provider && run.model
              ? `${run.provider} · ${run.model}`
              : "(no model snapshot)"}
            {" · "}
            {run.messageCount} msg
          </p>
          {run.status === "FAILED" ? (
            <>
              <p className="break-words text-[11px] text-bad">
                {run.errorCode ?? "TASK_RUNNER_UNKNOWN_ERROR"}
              </p>
              {run.errorDetail ? (
                <p className="break-words text-[11px] text-ink-400">
                  {run.errorDetail}
                </p>
              ) : null}
            </>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function StatusPill({ status }: { status: TaskRunRecord["status"] }) {
  const palette: Record<string, string> = {
    REQUESTED: "bg-warn/15 text-warn",
    RUNNING: "bg-warn/15 text-warn",
    DONE: "bg-ok/15 text-ok",
    FAILED: "bg-bad/15 text-bad",
  };
  const cls = palette[status] ?? "bg-ink-800 text-ink-300";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cls}`}
    >
      {status.toLowerCase()}
    </span>
  );
}
