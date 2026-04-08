import type { ProjectContextRecord } from "@/server/project-contexts";

export function ContextList({ contexts }: { contexts: ProjectContextRecord[] }) {
  if (contexts.length === 0) {
    return <p className="text-[11px] text-ink-500">No context snippets yet.</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {contexts.map((ctx) => (
        <li
          key={ctx.id}
          className="rounded-md border border-ink-800 bg-ink-950 px-3 py-2"
        >
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-xs font-semibold text-ink-100">
              {ctx.label}
            </p>
            <time
              className="shrink-0 text-[10px] text-ink-500"
              dateTime={ctx.updatedAt.toISOString()}
            >
              {ctx.updatedAt.toLocaleString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </time>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-[11px] text-ink-300">
            {ctx.content}
          </p>
        </li>
      ))}
    </ul>
  );
}
