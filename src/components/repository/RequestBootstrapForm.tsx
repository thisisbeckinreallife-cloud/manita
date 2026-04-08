"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { requestBootstrapAction } from "@/app/actions/repository-links";
import { initialRequestBootstrapState } from "@/app/actions/repository-links.state";

export function RequestBootstrapForm({
  projectId,
  defaultName,
}: {
  projectId: string;
  defaultName?: string;
}) {
  const [state, formAction] = useFormState(
    requestBootstrapAction,
    initialRequestBootstrapState,
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
          htmlFor={`repo-owner-${projectId}`}
          className="text-[10px] font-semibold uppercase tracking-wider text-ink-400"
        >
          GitHub owner
        </label>
        <input
          id={`repo-owner-${projectId}`}
          name="owner"
          required
          maxLength={39}
          placeholder="username-or-org"
          className="rounded-md border border-ink-700 bg-ink-950 px-2.5 py-1.5 text-xs text-ink-100 placeholder:text-ink-500 focus:border-accent focus:outline-none"
        />
        {state.fieldErrors?.owner?.[0] ? (
          <p className="text-[11px] text-bad">{state.fieldErrors.owner[0]}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor={`repo-name-${projectId}`}
          className="text-[10px] font-semibold uppercase tracking-wider text-ink-400"
        >
          Repository name
        </label>
        <input
          id={`repo-name-${projectId}`}
          name="name"
          required
          maxLength={100}
          defaultValue={defaultName}
          placeholder="my-repo"
          className="rounded-md border border-ink-700 bg-ink-950 px-2.5 py-1.5 text-xs text-ink-100 placeholder:text-ink-500 focus:border-accent focus:outline-none"
        />
        {state.fieldErrors?.name?.[0] ? (
          <p className="text-[11px] text-bad">{state.fieldErrors.name[0]}</p>
        ) : null}
      </div>
      <label className="flex items-center gap-2 text-[11px] text-ink-300">
        <input
          type="checkbox"
          name="private"
          value="true"
          defaultChecked
          className="h-3 w-3 rounded border-ink-700 bg-ink-950 text-accent focus:ring-accent"
        />
        Private repository
      </label>
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
      className="rounded-md bg-accent px-2.5 py-1.5 text-xs font-semibold text-ink-950 transition disabled:opacity-50"
    >
      {pending ? "Requesting…" : "Request bootstrap"}
    </button>
  );
}
