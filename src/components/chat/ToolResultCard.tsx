import type { MessageRecord } from "@/server/messages";

type ToolResultPayload = {
  ok?: boolean;
  excerpt?: string;
  lines?: number;
};

function parsePayload(raw: string | null): ToolResultPayload {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function ToolResultCard({ message }: { message: MessageRecord }) {
  const payload = parsePayload(message.payload);
  // Default to "not ok" (unknown = red) when the payload is missing or
  // malformed. The honesty contract forbids painting a result green
  // without evidence — absent data is evidence of nothing, not success.
  const ok = payload.ok === true;
  return (
    <div
      className={`ml-6 flex flex-col gap-1 rounded-md border px-3 py-2 text-[11px] ${
        ok
          ? "border-ok/30 bg-ok/5 text-ink-200"
          : "border-bad/30 bg-bad/5 text-ink-200"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-[10px] font-semibold uppercase tracking-wider ${
            ok ? "text-ok" : "text-bad"
          }`}
        >
          {ok ? "result" : "failed"}
        </span>
        {payload.lines !== undefined ? (
          <span className="text-[10px] text-ink-500">
            {payload.lines} line{payload.lines === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>
      {payload.excerpt ? (
        <pre className="max-h-48 overflow-auto whitespace-pre-wrap font-mono text-[11px] text-ink-300">
          {payload.excerpt}
        </pre>
      ) : message.content ? (
        <p className="whitespace-pre-wrap text-ink-300">{message.content}</p>
      ) : null}
    </div>
  );
}
