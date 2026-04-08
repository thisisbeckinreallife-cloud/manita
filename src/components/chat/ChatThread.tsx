import type { MessageRecord } from "@/server/messages";

export function ChatThread({ messages }: { messages: MessageRecord[] }) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <p className="text-sm text-ink-300">No messages yet.</p>
        <p className="mt-1 text-xs text-ink-400">
          Start the conversation in the composer below. Provider replies land in slice 1c.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-8 py-6">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
}

function MessageBubble({ message }: { message: MessageRecord }) {
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
