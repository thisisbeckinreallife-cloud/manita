import type { RepositoryLinkRecord } from "@/server/repository-links";
import { RequestBootstrapForm } from "@/components/repository/RequestBootstrapForm";

type ProjectHeader = { id: string; name: string } | null;

export function RightPane({
  project,
  repositoryLink,
}: {
  project: ProjectHeader;
  repositoryLink: RepositoryLinkRecord | null;
}) {
  return (
    <aside className="flex h-full flex-col border-l border-ink-800 bg-ink-900">
      <header className="flex items-center justify-between border-b border-ink-800 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-300">
          Operational truth
        </h2>
        <StatusPill repositoryLink={repositoryLink} project={project} />
      </header>
      <div className="flex flex-col gap-4 overflow-y-auto px-4 py-4 text-sm">
        <Section label="Repository">
          <RepositorySection project={project} link={repositoryLink} />
        </Section>
        <Section label="Deploy target">
          <Empty>
            {project ? "No deploy target linked" : "Select a project"}
          </Empty>
        </Section>
        <Section label="Last deploy">
          <Empty>No deploys yet</Empty>
        </Section>
        <Section label="Preview">
          <Empty>Preview unavailable</Empty>
        </Section>
        <Section label="Recent events">
          <Empty>No events recorded</Empty>
        </Section>
      </div>
    </aside>
  );
}

function RepositorySection({
  project,
  link,
}: {
  project: ProjectHeader;
  link: RepositoryLinkRecord | null;
}) {
  if (!project) {
    return <Empty>Select a project</Empty>;
  }
  if (!link) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-ink-400">No repository linked</p>
        <RequestBootstrapForm
          projectId={project.id}
          defaultName={toRepoSlug(project.id)}
        />
      </div>
    );
  }

  if (link.status === "OBSERVED" && link.observedUrl) {
    return (
      <div className="flex flex-col gap-1.5">
        <p className="text-[10px] uppercase tracking-wider text-ok">
          Observed
        </p>
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

  // REQUESTED (fallback) — the synchronous flow normally transitions
  // immediately to OBSERVED or FAILED, so seeing REQUESTED means a request
  // is mid-flight or the server was killed between the upsert and the
  // provider call.
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

function StatusPill({
  repositoryLink,
  project,
}: {
  repositoryLink: RepositoryLinkRecord | null;
  project: ProjectHeader;
}) {
  if (!project) {
    return (
      <span className="rounded-full bg-ink-800 px-2 py-0.5 text-[10px] uppercase tracking-wider text-ink-300">
        idle
      </span>
    );
  }
  if (!repositoryLink) {
    return (
      <span className="rounded-full bg-ink-800 px-2 py-0.5 text-[10px] uppercase tracking-wider text-ink-300">
        unlinked
      </span>
    );
  }
  const palette: Record<string, string> = {
    REQUESTED: "bg-warn/15 text-warn",
    OBSERVED: "bg-ok/15 text-ok",
    FAILED: "bg-bad/15 text-bad",
  };
  const cls = palette[repositoryLink.status] ?? "bg-ink-800 text-ink-300";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${cls}`}
    >
      {repositoryLink.status.toLowerCase()}
    </span>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">{label}</p>
      <div className="rounded-md border border-ink-800 bg-ink-950 px-3 py-2">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-ink-400">{children}</p>;
}

function formatDate(value: Date | null): string {
  if (!value) return "";
  return value.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toRepoSlug(projectId: string): string {
  // Strip the cuid prefix to give the form a friendlier default. The user
  // can overwrite it before submitting.
  return `vibe-${projectId.slice(-8).toLowerCase()}`;
}
