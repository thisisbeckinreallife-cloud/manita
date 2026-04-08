import type { MessageRecord } from "@/server/messages";
import { ToolIcon } from "./messageIcons";
import { ToolResultCard } from "./ToolResultCard";

type ToolCallPayload = {
  tool?: string;
  title?: string;
  command?: string;
  target?: string;
};

function parsePayload(raw: string | null): ToolCallPayload {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function ToolCallCard({
  message,
  results,
}: {
  message: MessageRecord;
  // Nested TOOL_RESULT rows rendered under this tool call. Named
  // `results` (not `children`) so it does not collide with React's
  // implicit children prop and it reads as a list of observations.
  results: MessageRecord[];
}) {
  const payload = parsePayload(message.payload);
  const tool = payload.tool ?? "run";
  const title = payload.title ?? message.content ?? tool;

  return (
    <article className="flex flex-col gap-1.5">
      <details className="group flex flex-col gap-1.5">
        <summary
          className="flex cursor-pointer list-none items-center gap-2 rounded-md border border-ink-800 bg-ink-900 px-3 py-2 text-xs text-ink-100 transition hover:border-ink-700"
          title={payload.command ?? ""}
        >
          <ToolIcon tool={tool} className="h-3.5 w-3.5 shrink-0 text-ink-300" />
          <span className="flex-1 truncate">{title}</span>
          {payload.target ? (
            <span className="shrink-0 truncate font-mono text-[10px] text-ink-500">
              {payload.target}
            </span>
          ) : null}
          <time
            className="shrink-0 text-[10px] text-ink-500"
            dateTime={message.createdAt.toISOString()}
          >
            {message.createdAt.toLocaleString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
          <span className="ml-1 text-[10px] text-ink-500 group-open:rotate-180 transition">
            ▾
          </span>
        </summary>
        {payload.command ? (
          <pre className="ml-6 max-h-48 overflow-auto rounded-md border border-ink-800 bg-ink-950 px-3 py-2 font-mono text-[11px] text-ink-300">
            {payload.command}
          </pre>
        ) : null}
      </details>
      {results.map((result) => (
        <ToolResultCard key={result.id} message={result} />
      ))}
    </article>
  );
}
