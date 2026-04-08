"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  createProjectAction,
  type CreateProjectActionState,
} from "@/app/actions/projects";

const initialState: CreateProjectActionState = {
  error: null,
  fieldErrors: null,
};

export function CreateProjectForm() {
  const [state, formAction] = useFormState(createProjectAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
          Project name
        </label>
        <input
          name="name"
          required
          maxLength={80}
          placeholder="e.g. Vibe Workspace"
          className="rounded-md border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 focus:border-accent focus:outline-none"
        />
        {state.fieldErrors?.name?.[0] ? (
          <p className="text-xs text-bad">{state.fieldErrors.name[0]}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
          Description
        </label>
        <textarea
          name="description"
          rows={2}
          maxLength={500}
          placeholder="Optional"
          className="rounded-md border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 focus:border-accent focus:outline-none"
        />
        {state.fieldErrors?.description?.[0] ? (
          <p className="text-xs text-bad">{state.fieldErrors.description[0]}</p>
        ) : null}
      </div>

      {state.error ? <p className="text-xs text-bad">{state.error}</p> : null}

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
      className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-ink-950 transition disabled:opacity-50"
    >
      {pending ? "Creating…" : "Create project"}
    </button>
  );
}
