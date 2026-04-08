"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  createAttachmentAction,
  initialCreateAttachmentState,
} from "@/app/actions/attachments";
import { MAX_ATTACHMENT_BYTES } from "@/lib/validation/attachment";

export function AttachmentUploader({ taskId }: { taskId: string }) {
  const [state, formAction] = useFormState(
    createAttachmentAction,
    initialCreateAttachmentState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    if (state.succeededAt > 0) {
      formRef.current?.reset();
      setClientError(null);
    }
  }, [state.succeededAt]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setClientError("File exceeds the 10 MB limit.");
      // Clear the input so the same oversize file does not stay "selected"
      // in the picker UI without an upload happening.
      formRef.current?.reset();
      return;
    }
    setClientError(null);
    // Auto-submit on selection so the user does not need a second click.
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-1.5"
      encType="multipart/form-data"
    >
      <input type="hidden" name="taskId" value={taskId} />
      <div className="flex items-center gap-2">
        <label
          htmlFor={`attachment-input-${taskId}`}
          className="cursor-pointer rounded-md border border-dashed border-ink-700 bg-ink-900 px-3 py-1.5 text-xs text-ink-200 transition hover:border-ink-500 hover:text-ink-100"
        >
          Attach file
        </label>
        <input
          id={`attachment-input-${taskId}`}
          type="file"
          name="file"
          required
          className="sr-only"
          onChange={handleChange}
        />
        <SubmitHint />
      </div>
      {clientError ? (
        <p className="text-[11px] text-bad">{clientError}</p>
      ) : state.error ? (
        <p className="text-[11px] text-bad">{state.error}</p>
      ) : null}
    </form>
  );
}

function SubmitHint() {
  const { pending } = useFormStatus();
  return (
    <span className="text-[11px] text-ink-500">
      {pending ? "Uploading…" : "Up to 10 MB"}
    </span>
  );
}
