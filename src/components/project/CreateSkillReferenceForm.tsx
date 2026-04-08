"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createProjectSkillReferenceAction } from "@/app/actions/project-skill-references";
import { initialCreateProjectSkillReferenceState } from "@/app/actions/project-skill-references.state";

export function CreateSkillReferenceForm({
  projectId,
}: {
  projectId: string;
}) {
  const [state, formAction] = useFormState(
    createProjectSkillReferenceAction,
    initialCreateProjectSkillReferenceState,
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
          htmlFor={`skill-name-${projectId}`}
          className="text-[10px] font-semibold uppercase tracking-wider text-ink-400"
        >
          Skill name
        </label>
        <input
          id={`skill-name-${projectId}`}
          name="name"
          required
          maxLength={120}
          placeholder="e.g. brief-to-spec"
          className="rounded-md border border-ink-700 bg-ink-950 px-2.5 py-1.5 text-xs text-ink-100 placeholder:text-ink-500 focus:border-accent focus:outline-none"
        />
        {state.fieldErrors?.name?.[0] ? (
          <p className="text-[11px] text-bad">{state.fieldErrors.name[0]}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor={`skill-source-${projectId}`}
          className="text-[10px] font-semibold uppercase tracking-wider text-ink-400"
        >
          Source (optional)
        </label>
        <input
          id={`skill-source-${projectId}`}
          name="source"
          maxLength={500}
          placeholder="URL, path, or package name"
          className="rounded-md border border-ink-700 bg-ink-950 px-2.5 py-1.5 text-xs text-ink-100 placeholder:text-ink-500 focus:border-accent focus:outline-none"
        />
        {state.fieldErrors?.source?.[0] ? (
          <p className="text-[11px] text-bad">{state.fieldErrors.source[0]}</p>
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
      {pending ? "Adding…" : "Add skill reference"}
    </button>
  );
}
