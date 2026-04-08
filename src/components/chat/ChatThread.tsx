import type { MessageRecord } from "@/server/messages";
import { MessageBubble } from "./MessageBubble";
import { ToolCallCard } from "./ToolCallCard";
import { ToolResultCard } from "./ToolResultCard";
import { PlanBlock } from "./PlanBlock";

export function ChatThread({ messages }: { messages: MessageRecord[] }) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <p className="text-sm text-ink-300">No messages yet.</p>
        <p className="mt-1 text-xs text-ink-400">
          Write a message below and click Send, pick a model, then click Run task.
        </p>
      </div>
    );
  }

  // Build a tree: a TOOL_RESULT nests under its parent ONLY when (a) the
  // parent exists in the current list AND (b) the parent is itself a
  // TOOL_CALL. Any other case (null parent, orphaned reference, parent
  // of a different kind) falls through to top-level rendering so the
  // user never silently loses a result. The server also enforces this
  // invariant on write — see src/server/messages.ts — but we defend in
  // depth here because the bug is invisible by construction if missed.
  const byId = new Map(messages.map((m) => [m.id, m]));
  const childrenIndex = new Map<string, MessageRecord[]>();
  const topLevel: MessageRecord[] = [];

  for (const message of messages) {
    const parentId = message.parentMessageId;
    const parent = parentId ? byId.get(parentId) : undefined;
    const canNest =
      message.kind === "TOOL_RESULT" && parent?.kind === "TOOL_CALL";
    if (canNest && parentId) {
      const list = childrenIndex.get(parentId) ?? [];
      list.push(message);
      childrenIndex.set(parentId, list);
    } else {
      topLevel.push(message);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-8 py-6">
      {topLevel.map((message) => (
        <MessageNode
          key={message.id}
          message={message}
          results={childrenIndex.get(message.id) ?? []}
        />
      ))}
    </div>
  );
}

function MessageNode({
  message,
  results,
}: {
  message: MessageRecord;
  results: MessageRecord[];
}) {
  switch (message.kind) {
    case "TOOL_CALL":
      return <ToolCallCard message={message} results={results} />;
    case "TOOL_RESULT":
      return <ToolResultCard message={message} />;
    case "PLAN":
      return <PlanBlock message={message} />;
    case "TEXT":
    default:
      return <MessageBubble message={message} />;
  }
}
