import type { MessageRecord } from "@/server/messages";

type PlanStepStatus = "REQUESTED" | "RUNNING" | "DONE" | "FAILED";

type PlanStep = {
  index: number;
  title: string;
  status: PlanStepStatus;
};

const VALID_STATUSES: readonly PlanStepStatus[] = [
  "REQUESTED",
  "RUNNING",
  "DONE",
  "FAILED",
];

/**
 * Defensively parse the plan payload, dropping any malformed step
 * entries. A single bad row must NOT crash the whole thread render,
 * so every field is validated before being pushed into the output.
 */
function parseSteps(raw: string | null): PlanStep[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("steps" in parsed) ||
    !Array.isArray((parsed as { steps: unknown }).steps)
  ) {
    return [];
  }
  const out: PlanStep[] = [];
  for (const entry of (parsed as { steps: unknown[] }).steps) {
    if (typeof entry !== "object" || entry === null) continue;
    const e = entry as Record<string, unknown>;
    const index = typeof e.index === "number" ? e.index : null;
    const title = typeof e.title === "string" ? e.title : null;
    const statusRaw = typeof e.status === "string" ? e.status : null;
    if (
      index === null ||
      title === null ||
      statusRaw === null ||
      !(VALID_STATUSES as readonly string[]).includes(statusRaw)
    ) {
      continue;
    }
    out.push({ index, title, status: statusRaw as PlanStepStatus });
  }
  return out;
}

export function PlanBlock({ message }: { message: MessageRecord }) {
  const steps = parseSteps(message.payload);
  const doneCount = steps.filter((s) => s.status === "DONE").length;

  return (
    <article className="flex flex-col gap-2 rounded-lg border border-ink-800 bg-ink-900 px-4 py-3">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
            plan
          </span>
          {steps.length > 0 ? (
            <span className="text-[10px] text-ink-500">
              {doneCount}/{steps.length}
            </span>
          ) : null}
        </div>
        <time
          className="text-[10px] text-ink-500"
          dateTime={message.createdAt.toISOString()}
        >
          {message.createdAt.toLocaleString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
      </header>
      {message.content ? (
        <p className="whitespace-pre-wrap text-xs text-ink-200">
          {message.content}
        </p>
      ) : null}
      {steps.length === 0 ? (
        <p className="text-[11px] text-ink-500">No steps in this plan.</p>
      ) : (
        <ol className="flex flex-col gap-1">
          {steps.map((step) => (
            <li
              key={step.index}
              className="flex items-start gap-2 text-[11px]"
            >
              <span
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold ${statusClass(
                  step.status,
                )}`}
              >
                {step.index}
              </span>
              <span className="flex-1 text-ink-200">{step.title}</span>
              <span
                className={`shrink-0 text-[9px] uppercase tracking-wider ${statusTextClass(
                  step.status,
                )}`}
              >
                {step.status.toLowerCase()}
              </span>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}

function statusClass(status: PlanStep["status"]): string {
  switch (status) {
    case "DONE":
      return "bg-ok/20 text-ok";
    case "FAILED":
      return "bg-bad/20 text-bad";
    case "RUNNING":
      return "bg-warn/20 text-warn";
    default:
      return "bg-ink-800 text-ink-300";
  }
}

function statusTextClass(status: PlanStep["status"]): string {
  switch (status) {
    case "DONE":
      return "text-ok";
    case "FAILED":
      return "text-bad";
    case "RUNNING":
      return "text-warn";
    default:
      return "text-ink-500";
  }
}
