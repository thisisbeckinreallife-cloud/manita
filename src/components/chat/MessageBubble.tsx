import type { MessageRecord } from "@/server/messages";

/**
 * Plain text message bubble (the slice-1a render, extracted so the
 * tree dispatcher in ChatThread can reuse it without branching.)
 */
export function MessageBubble({ message }: { message: MessageRecord }) {
  const isUser = message.role === "USER";
  const isAssistant = message.role === "ASSISTANT";

  return (
    <article
      className={`flex max-w-3xl flex-col gap-1 ${
        isUser ? "ml-auto items-end" : "items-start"
      }`}
    >
      <header className="flex items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
          {message.role.toLowerCase()}
        </span>
        <time
          className="text-[10px] text-ink-500"
          dateTime={message.createdAt.toISOString()}
        >
          {message.createdAt.toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
      </header>
      <div
        className={`whitespace-pre-wrap rounded-lg border px-4 py-2 text-sm ${
          isUser
            ? "border-accent/30 bg-accent/10 text-ink-100"
            : isAssistant
              ? "border-ink-700 bg-ink-900 text-ink-100"
              : "border-ink-800 bg-ink-950 text-ink-300"
        }`}
      >
        {message.content}
      </div>
    </article>
  );
}
