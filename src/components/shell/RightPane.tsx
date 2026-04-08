type ProjectHeader = { id: string; name: string } | null;

export function RightPane({ project }: { project: ProjectHeader }) {
  return (
    <aside className="flex h-full flex-col border-l border-ink-800 bg-ink-900">
      <header className="flex items-center justify-between border-b border-ink-800 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-300">
          Operational truth
        </h2>
        <span className="rounded-full bg-ink-800 px-2 py-0.5 text-[10px] uppercase tracking-wider text-ink-300">
          idle
        </span>
      </header>
      <div className="flex flex-col gap-4 px-4 py-4 text-sm">
        <Section label="Repository">
          <Empty>
            {project ? "No repository linked to this project" : "Select a project"}
          </Empty>
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
