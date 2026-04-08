import type { ProjectRuleRecord } from "@/server/project-rules";

export function RuleList({ rules }: { rules: ProjectRuleRecord[] }) {
  if (rules.length === 0) {
    return <p className="text-[11px] text-ink-500">No rules yet.</p>;
  }
  return (
    <ol className="flex flex-col gap-2">
      {rules.map((rule) => (
        <li
          key={rule.id}
          className="rounded-md border border-ink-800 bg-ink-950 px-3 py-2"
        >
          <p className="text-xs font-semibold text-ink-100">{rule.title}</p>
          <p className="mt-1 whitespace-pre-wrap text-[11px] text-ink-300">
            {rule.body}
          </p>
        </li>
      ))}
    </ol>
  );
}
