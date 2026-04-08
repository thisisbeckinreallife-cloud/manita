import type { DeployEventRecord } from "@/server/deploy-runs";

export function DeployEventList({ events }: { events: DeployEventRecord[] }) {
  if (events.length === 0) {
    return <p className="text-[11px] text-ink-500">No events recorded</p>;
  }
  return (
    <ul className="flex flex-col gap-1">
      {events.map((event) => (
        <li key={event.id} className="flex items-start gap-2 text-[11px]">
          <span
            className={`mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${dotFor(event.kind)}`}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-ink-200">{event.message}</p>
            <p className="text-[10px] text-ink-500">
              {event.kind.toLowerCase()} ·{" "}
              {event.createdAt.toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function dotFor(kind: DeployEventRecord["kind"]): string {
  switch (kind) {
    case "REQUESTED":
      return "bg-warn";
    case "STATUS_CHANGED":
      return "bg-ink-300";
    case "LOG":
      return "bg-ink-500";
    case "FINISHED":
      return "bg-ok";
    case "FAILED":
      return "bg-bad";
  }
}
