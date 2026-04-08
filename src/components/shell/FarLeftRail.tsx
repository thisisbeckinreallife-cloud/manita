import Link from "next/link";
import type { ProjectListItem } from "@/server/projects";

export function FarLeftRail({
  projects,
  selectedId,
}: {
  projects: ProjectListItem[];
  selectedId?: string;
}) {
  return (
    <aside className="flex h-full flex-col items-center gap-3 border-r border-ink-800 bg-ink-900 py-4">
      <Link
        href="/"
        className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-sm font-semibold text-ink-950"
        title="Workspace home"
      >
        V
      </Link>
      <div className="mt-2 h-px w-8 bg-ink-800" />

      <nav className="flex flex-col items-center gap-2">
        {projects.map((project) => {
          const initial = project.name.trim().charAt(0).toUpperCase() || "•";
          const active = project.id === selectedId;
          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              title={project.name}
              className={`flex h-9 w-9 items-center justify-center rounded-md text-sm font-semibold transition ${
                active
                  ? "bg-accent text-ink-950"
                  : "bg-ink-800 text-ink-200 hover:bg-ink-700"
              }`}
            >
              {initial}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
