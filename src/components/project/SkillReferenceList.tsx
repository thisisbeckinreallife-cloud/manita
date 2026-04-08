import type { ProjectSkillReferenceRecord } from "@/server/project-skill-references";

export function SkillReferenceList({
  skillRefs,
}: {
  skillRefs: ProjectSkillReferenceRecord[];
}) {
  if (skillRefs.length === 0) {
    return <p className="text-[11px] text-ink-500">No skill references yet.</p>;
  }
  return (
    <ul className="flex flex-col gap-1.5">
      {skillRefs.map((ref) => (
        <li
          key={ref.id}
          className="flex items-center justify-between gap-2 rounded-md border border-ink-800 bg-ink-950 px-2.5 py-1.5 text-xs text-ink-200"
        >
          <span className="truncate font-medium">{ref.name}</span>
          {ref.source ? (
            <span
              className="ml-2 shrink-0 truncate text-[10px] text-ink-500"
              title={ref.source}
            >
              {ref.source}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
