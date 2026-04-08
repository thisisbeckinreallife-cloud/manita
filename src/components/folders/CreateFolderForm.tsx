"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createFolderAction } from "@/app/actions/folders";
import { initialCreateFolderState } from "@/app/actions/folders.state";

export function CreateFolderForm({ projectId }: { projectId: string }) {
  const [state, formAction] = useFormState(createFolderAction, initialCreateFolderState);
  const formRef = useRef<HTMLFormElement>(null);

  // Reset the input after each successful create so the user can immediately
  // type the next folder name. The action increments succeededAt on success.
  useEffect(() => {
    if (state.succeededAt > 0) formRef.current?.reset();
  }, [state.succeededAt]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-1.5">
      <input type="hidden" name="projectId" value={projectId} />
      <label htmlFor="folder-name-input" className="sr-only">
        New folder name
      </label>
      <div className="flex gap-1.5">
        <input
          id="folder-name-input"
          name="name"
          required
          maxLength={80}
          placeholder="New folder name"
          className="min-w-0 flex-1 rounded-md border border-ink-700 bg-ink-950 px-2.5 py-1.5 text-xs text-ink-100 placeholder:text-ink-500 focus:border-accent focus:outline-none"
        />
        <SubmitButton />
      </div>
      {state.fieldErrors?.name?.[0] ? (
        <p className="text-[11px] text-bad">{state.fieldErrors.name[0]}</p>
      ) : null}
      {state.error && !state.fieldErrors ? (
        <p className="text-[11px] text-bad">{state.error}</p>
      ) : null}
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 rounded-md bg-ink-700 px-2.5 py-1.5 text-xs font-semibold text-ink-100 transition hover:bg-ink-600 disabled:opacity-50"
    >
      {pending ? "…" : "Add"}
    </button>
  );
}
