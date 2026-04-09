import type { RepositoryLinkRecord } from "@/server/repository-links";
import type { DeployTargetRecord } from "@/server/deploy-targets";
import type {
  DeployEventRecord,
  DeployRunRecord,
} from "@/server/deploy-runs";
import { RequestBootstrapForm } from "@/components/repository/RequestBootstrapForm";
import { LinkDeployTargetForm } from "@/components/deploy/LinkDeployTargetForm";
import { TriggerDeployButton } from "@/components/deploy/TriggerDeployButton";
import { DeployEventList } from "@/components/deploy/DeployEventList";
import { PreviewFrame } from "@/components/deploy/PreviewFrame";

type ProjectHeader = { id: string; name: string } | null;

type LatestRun = (DeployRunRecord & { events: DeployEventRecord[] }) | null;

type PreviewEndpointRecord = {
  url: string;
  observedAt: Date;
  lastRunId: string | null;
} | null;

export function RightPane({
  project,
  repositoryLink,
  deployTarget,
  latestRun,
  previewEndpoint,
}: {
  project: ProjectHeader;
  repositoryLink: RepositoryLinkRecord | null;
  deployTarget: DeployTargetRecord | null;
  latestRun: LatestRun;
  previewEndpoint: PreviewEndpointRecord;
}) {
  const previewIsStale =
    previewEndpoint !== null &&
    ((latestRun !== null && latestRun.status === "FAILED") ||
      (latestRun !== null && latestRun.id !== previewEndpoint.lastRunId));
  return (
    <aside className="flex h-full min-h-0 flex-col border-l border-ink-800 bg-ink-900">
      <header className="flex items-center justify-between border-b border-ink-800 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-300">
          Preview
        </h2>
        <HeaderStatusPill
          project={project}
          repositoryLink={repositoryLink}
          latestRun={latestRun}
        />
      </header>
      <div className="flex min-h-0 flex-1 flex-col">
        {previewEndpoint ? (
          <PreviewFrame
            url={previewEndpoint.url}
            isStale={previewIsStale}
            observedAt={previewEndpoint.observedAt}
          />
        ) : (
          <PreviewEmptyState project={project} target={deployTarget} run={latestRun} />
        )}
      </div>
      <details className="group border-t border-ink-800 bg-ink-900">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-400 hover:text-ink-200">
          <span>Operational truth</span>
          <span className="text-ink-500 transition-transform group-open:rotate-180">
            <ChevronIcon />
          </span>
        </summary>
        <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto border-t border-ink-800 px-4 py-3 text-sm">
          <Section label="Repository">
            <RepositorySection project={project} link={repositoryLink} />
          </Section>
          <Section label="Deploy target">
            <DeployTargetSection project={project} target={deployTarget} />
          </Section>
          <Section label="Last deploy">
            <LastDeploySection
              project={project}
              target={deployTarget}
              run={latestRun}
            />
          </Section>
          <Section label="Recent events">
            <EventsSection run={latestRun} target={deployTarget} />
          </Section>
        </div>
      </details>
    </aside>
  );
}

function PreviewEmptyState({
  project,
  target,
  run,
}: {
  project: ProjectHeader;
  target: DeployTargetRecord | null;
  run: LatestRun;
}) {
  const reason = !project
    ? "Select a project to see its deploy preview here."
    : !target
      ? "Link a Railway deploy target to start publishing this project."
      : !run
        ? "No deploys yet. Trigger one from the Operational truth section below."
        : run.status === "FAILED"
          ? "The last deploy failed, so there is nothing live to preview. Inspect the error below and retry."
          : "Waiting for the current deploy to go live.";
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
        Preview unavailable
      </p>
      <p className="max-w-xs text-xs text-ink-400">{reason}</p>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="10"
      height="10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

// ---------- sections ----------

function RepositorySection({
  project,
  link,
}: {
  project: ProjectHeader;
  link: RepositoryLinkRecord | null;
}) {
  if (!project) return <Empty>Select a project</Empty>;
  if (!link) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-ink-400">No repository linked</p>
        <RequestBootstrapForm
          projectId={project.id}
          defaultName={`vibe-${project.id.slice(-8).toLowerCase()}`}
        />
      </div>
    );
  }
  if (link.status === "OBSERVED" && link.observedUrl) {
    return (
      <div className="flex flex-col gap-1.5">
        <p className="text-[10px] uppercase tracking-wider text-ok">Observed</p>
        <a
          href={link.observedUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="break-all text-xs font-medium text-ink-100 underline decoration-ink-700 underline-offset-2 hover:decoration-accent"
        >
          {link.observedOwner}/{link.observedName}
        </a>
        <p className="text-[10px] text-ink-500">
          Linked {formatDate(link.observedAt)}
        </p>
      </div>
    );
  }
  if (link.status === "FAILED") {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-[10px] uppercase tracking-wider text-bad">Failed</p>
        <p className="text-xs text-ink-100">
          {link.requestedOwner}/{link.requestedName}
        </p>
        <p className="break-words text-[11px] text-bad">
          {link.errorCode ?? "GITHUB_UNKNOWN_ERROR"}
        </p>
        {link.errorDetail ? (
          <p className="break-words text-[11px] text-ink-400">{link.errorDetail}</p>
        ) : null}
        <details className="mt-1">
          <summary className="cursor-pointer text-[11px] text-ink-400 hover:text-ink-200">
            Retry bootstrap
          </summary>
          <div className="mt-2">
            <RequestBootstrapForm
              projectId={project.id}
              defaultName={link.requestedName}
            />
          </div>
        </details>
      </div>
    );
  }
  // REQUESTED fallback.
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[10px] uppercase tracking-wider text-warn">Requested</p>
      <p className="text-xs text-ink-100">
        {link.requestedOwner}/{link.requestedName}
      </p>
      <p className="text-[10px] text-ink-500">
        Waiting for GitHub to confirm the repository.
      </p>
    </div>
  );
}

function DeployTargetSection({
  project,
  target,
}: {
  project: ProjectHeader;
  target: DeployTargetRecord | null;
}) {
  if (!project) return <Empty>Select a project</Empty>;
  if (!target) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-ink-400">No deploy target linked</p>
        <LinkDeployTargetForm projectId={project.id} />
      </div>
    );
  }
  return (
    <details className="flex flex-col gap-1">
      <summary className="cursor-pointer text-xs text-ink-200">
        {target.provider} · {target.railwayServiceId}
      </summary>
      <dl className="mt-2 flex flex-col gap-1 text-[11px] text-ink-400">
        <Row label="Project" value={target.railwayProjectId} />
        <Row label="Service" value={target.railwayServiceId} />
        <Row
          label="Environment"
          value={target.railwayEnvironmentId ?? "(unset)"}
        />
        <Row label="Linked" value={formatDate(target.updatedAt)} />
      </dl>
      <div className="mt-2">
        <LinkDeployTargetForm
          projectId={project.id}
          defaults={{
            railwayProjectId: target.railwayProjectId,
            railwayServiceId: target.railwayServiceId,
            railwayEnvironmentId: target.railwayEnvironmentId,
          }}
        />
      </div>
    </details>
  );
}

function LastDeploySection({
  project,
  target,
  run,
}: {
  project: ProjectHeader;
  target: DeployTargetRecord | null;
  run: LatestRun;
}) {
  if (!project) return <Empty>Select a project</Empty>;
  if (!target) return <Empty>Link a deploy target first</Empty>;
  if (!run) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-ink-400">No deploys yet</p>
        <TriggerDeployButton projectId={project.id} />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <RunStatusPill status={run.status} />
        <p className="text-[10px] text-ink-500">
          {formatDate(run.requestedAt)}
        </p>
      </div>
      {run.branch || run.commitSha ? (
        <p className="text-[11px] text-ink-400">
          {run.branch ?? "(branch unset)"}
          {run.commitSha ? ` · ${run.commitSha.slice(0, 7)}` : ""}
        </p>
      ) : null}
      {run.status === "FAILED" ? (
        <>
          <p className="break-words text-[11px] text-bad">
            {run.errorCode ?? "RAILWAY_UNKNOWN_ERROR"}
          </p>
          {run.errorDetail ? (
            <p className="break-words text-[11px] text-ink-400">
              {run.errorDetail}
            </p>
          ) : null}
        </>
      ) : null}
      <TriggerDeployButton projectId={project.id} />
    </div>
  );
}

function EventsSection({
  run,
  target,
}: {
  run: LatestRun;
  target: DeployTargetRecord | null;
}) {
  if (!target) return <Empty>No events recorded</Empty>;
  if (!run) return <Empty>No events recorded</Empty>;
  return <DeployEventList events={run.events} />;
}

// ---------- primitives ----------

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
        {label}
      </p>
      <div className="rounded-md border border-ink-800 bg-ink-950 px-3 py-2">
        {children}
      </div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-ink-400">{children}</p>;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-[10px] uppercase tracking-wider text-ink-500">
        {label}
      </dt>
      <dd className="truncate text-ink-300">{value}</dd>
    </div>
  );
}

function HeaderStatusPill({
  project,
  repositoryLink,
  latestRun,
}: {
  project: ProjectHeader;
  repositoryLink: RepositoryLinkRecord | null;
  latestRun: LatestRun;
}) {
  if (!project) return <Pill tone="idle">idle</Pill>;
  if (latestRun) {
    const tone =
      latestRun.status === "LIVE"
        ? "ok"
        : latestRun.status === "FAILED"
          ? "bad"
          : "warn";
    return <Pill tone={tone}>{latestRun.status.toLowerCase()}</Pill>;
  }
  if (repositoryLink) {
    const tone =
      repositoryLink.status === "OBSERVED"
        ? "ok"
        : repositoryLink.status === "FAILED"
          ? "bad"
          : "warn";
    return <Pill tone={tone}>{repositoryLink.status.toLowerCase()}</Pill>;
  }
  return <Pill tone="idle">unlinked</Pill>;
}

function RunStatusPill({ status }: { status: DeployRunRecord["status"] }) {
  const tone =
    status === "LIVE" ? "ok" : status === "FAILED" ? "bad" : "warn";
  return <Pill tone={tone}>{status.toLowerCase()}</Pill>;
}

function Pill({
  tone,
  children,
}: {
  tone: "ok" | "bad" | "warn" | "idle";
  children: React.ReactNode;
}) {
  const palette: Record<string, string> = {
    ok: "bg-ok/15 text-ok",
    bad: "bg-bad/15 text-bad",
    warn: "bg-warn/15 text-warn",
    idle: "bg-ink-800 text-ink-300",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${palette[tone]}`}
    >
      {children}
    </span>
  );
}

function formatDate(value: Date | null | undefined): string {
  if (!value) return "";
  return value.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
