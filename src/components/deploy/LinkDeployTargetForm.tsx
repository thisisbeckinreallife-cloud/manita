"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { linkDeployTargetAction } from "@/app/actions/deploy-targets";
import { initialLinkDeployTargetState } from "@/app/actions/deploy-targets.state";

export function LinkDeployTargetForm({
  projectId,
  defaults,
}: {
  projectId: string;
  defaults?: {
    railwayProjectId?: string;
    railwayServiceId?: string;
    railwayEnvironmentId?: string | null;
  };
}) {
  const [state, formAction] = useFormState(
    linkDeployTargetAction,
    initialLinkDeployTargetState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.succeededAt > 0) formRef.current?.reset();
  }, [state.succeededAt]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="projectId" value={projectId} />
      <Field
        id={`railway-project-${projectId}`}
        name="railwayProjectId"
        label="Railway project id"
        placeholder="prj_..."
        defaultValue={defaults?.railwayProjectId}
        error={state.fieldErrors?.railwayProjectId?.[0]}
      />
      <Field
        id={`railway-service-${projectId}`}
        name="railwayServiceId"
        label="Railway service id"
        placeholder="svc_..."
        defaultValue={defaults?.railwayServiceId}
        error={state.fieldErrors?.railwayServiceId?.[0]}
      />
      <Field
        id={`railway-env-${projectId}`}
        name="railwayEnvironmentId"
        label="Environment id (optional)"
        placeholder="env_..."
        defaultValue={defaults?.railwayEnvironmentId ?? ""}
        error={state.fieldErrors?.railwayEnvironmentId?.[0]}
        required={false}
      />
      {state.error && !state.fieldErrors ? (
        <p className="text-[11px] text-bad">{state.error}</p>
      ) : null}
      <SubmitButton hasDefaults={Boolean(defaults?.railwayProjectId)} />
    </form>
  );
}

function Field({
  id,
  name,
  label,
  placeholder,
  defaultValue,
  error,
  required = true,
}: {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  defaultValue?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-[10px] font-semibold uppercase tracking-wider text-ink-400"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        required={required}
        maxLength={128}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="rounded-md border border-ink-700 bg-ink-950 px-2.5 py-1.5 text-xs text-ink-100 placeholder:text-ink-500 focus:border-accent focus:outline-none"
      />
      {error ? <p className="text-[11px] text-bad">{error}</p> : null}
    </div>
  );
}

function SubmitButton({ hasDefaults }: { hasDefaults: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-ink-700 px-2.5 py-1.5 text-xs font-semibold text-ink-100 transition hover:bg-ink-600 disabled:opacity-50"
    >
      {pending ? "Saving…" : hasDefaults ? "Update target" : "Link target"}
    </button>
  );
}
