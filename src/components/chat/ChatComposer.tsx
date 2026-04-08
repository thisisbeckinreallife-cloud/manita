"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createMessageAction } from "@/app/actions/messages";
import { initialCreateMessageState } from "@/app/actions/messages.state";

export function ChatComposer({ taskId }: { taskId: string }) {
  const [state, formAction] = useFormState(createMessageAction, initialCreateMessageState);
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state.succeededAt > 0) {
      formRef.current?.reset();
      textareaRef.current?.focus();
    }
  }, [state.succeededAt]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Cmd/Ctrl+Enter submits, plain Enter inserts a newline.
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-2 border-t border-ink-800 bg-ink-950 px-6 py-4"
    >
      <input type="hidden" name="taskId" value={taskId} />
      <label htmlFor="chat-composer-input" className="sr-only">
        Message
      </label>
      <textarea
        id="chat-composer-input"
        ref={textareaRef}
        name="content"
        required
        rows={3}
        maxLength={8000}
        placeholder="Write a message…  (⌘/Ctrl + Enter to send)"
        onKeyDown={handleKeyDown}
        className="w-full resize-none rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 focus:border-accent focus:outline-none"
      />
      {state.fieldErrors?.content?.[0] ? (
        <p className="text-[11px] text-bad">{state.fieldErrors.content[0]}</p>
      ) : null}
      {state.error && !state.fieldErrors ? (
        <p className="text-[11px] text-bad">{state.error}</p>
      ) : null}
      <div className="flex items-center justify-end">
        <SendButton />
      </div>
    </form>
  );
}

function SendButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-ink-950 transition disabled:opacity-50"
    >
      {pending ? "Sending…" : "Send"}
    </button>
  );
}
