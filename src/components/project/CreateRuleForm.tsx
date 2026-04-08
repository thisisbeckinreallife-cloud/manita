"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createProjectRuleAction } from "@/app/actions/project-rules";
import { initialCreateProjectRuleState } from "@/app/actions/project-rules.state";

export function CreateRuleForm({ projectId }: { projectId: string }) {
  const [state, formAction] = useFormState(
    createProjectRuleAction,
    initialCreateProjectRuleState,
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
          htmlFor={`rule-title-${projectId}`}
          className="text-[10px] font-semibold uppercase tracking-wider text-ink-400"
        >
          Rule title
        </label>
        <input
          id={`rule-title-${projectId}`}
          name="title"
          required
          maxLength={120}
          placeholder="e.g. Prefer adapters over vendor lock-in"
          className="rounded-md border border-ink-700 bg-ink-950 px-2.5 py-1.5 text-xs text-ink-100 placeholder:text-ink-500 focus:border-accent focus:outline-none"
        />
        {state.fieldErrors?.title?.[0] ? (
          <p className="text-[11px] text-bad">{state.fieldErrors.title[0]}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor={`rule-body-${projectId}`}
          className="text-[10px] font-semibold uppercase tracking-wider text-ink-400"
        >
          Body
        </label>
        <textarea
          id={`rule-body-${projectId}`}
          name="body"
          required
          rows={3}
          maxLength={4000}
          placeholder="Explain the constraint or guideline."
          className="rounded-md border border-ink-700 bg-ink-950 px-2.5 py-1.5 text-xs text-ink-100 placeholder:text-ink-500 focus:border-accent focus:outline-none"
        />
        {state.fieldErrors?.body?.[0] ? (
          <p className="text-[11px] text-bad">{state.fieldErrors.body[0]}</p>
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
      {pending ? "Adding…" : "Add rule"}
    </button>
  );
}
