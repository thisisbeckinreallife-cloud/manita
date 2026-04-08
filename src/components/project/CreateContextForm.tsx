"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createProjectContextAction } from "@/app/actions/project-contexts";
import { initialCreateProjectContextState } from "@/app/actions/project-contexts.state";

export function CreateContextForm({ projectId }: { projectId: string }) {
  const [state, formAction] = useFormState(
    createProjectContextAction,
    initialCreateProjectContextState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.succeededAt > 0) formRef.current?.reset();
  }, [state.succeededAt]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="projectId" value={projectId} />
      <div className="flex flex-col gap-1">
        <label
          htmlFor={`context-label-${projectId}`}
          className="text-[10px] font-semibold uppercase tracking-wider text-ink-400"
        >
          Label
        </label>
        <input
          id={`context-label-${projectId}`}
          name="label"
          required
          maxLength={120}
          placeholder="e.g. Architecture overview"
          className="rounded-md border border-ink-700 bg-ink-950 px-2.5 py-1.5 text-xs text-ink-100 placeholder:text-ink-500 focus:border-accent focus:outline-none"
        />
        {state.fieldErrors?.label?.[0] ? (
          <p className="text-[11px] text-bad">{state.fieldErrors.label[0]}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor={`context-content-${projectId}`}
          className="text-[10px] font-semibold uppercase tracking-wider text-ink-400"
        >
          Content
        </label>
        <textarea
          id={`context-content-${projectId}`}
          name="content"
          required
          rows={4}
          maxLength={8000}
          placeholder="Background, decisions, links — anything you want the AI to know."
          className="rounded-md border border-ink-700 bg-ink-950 px-2.5 py-1.5 text-xs text-ink-100 placeholder:text-ink-500 focus:border-accent focus:outline-none"
        />
        {state.fieldErrors?.content?.[0] ? (
          <p className="text-[11px] text-bad">{state.fieldErrors.content[0]}</p>
        ) : null}
      </div>
      {state.error && !state.fieldErrors ? (
        <p className="text-[11px] text-bad">{state.error}</p>
      ) : null}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="self-start rounded-md bg-ink-700 px-2.5 py-1.5 text-xs font-semibold text-ink-100 transition hover:bg-ink-600 disabled:opacity-50"
    >
      {pending ? "Adding…" : "Add context"}
    </button>
  );
}
