import type { ProjectRuleRecord } from "@/server/project-rules";
import type { ProjectContextRecord } from "@/server/project-contexts";
import type { ProjectSkillReferenceRecord } from "@/server/project-skill-references";
import { CreateRuleForm } from "./CreateRuleForm";
import { RuleList } from "./RuleList";
import { CreateContextForm } from "./CreateContextForm";
import { ContextList } from "./ContextList";
import { CreateSkillReferenceForm } from "./CreateSkillReferenceForm";
import { SkillReferenceList } from "./SkillReferenceList";

export function ProjectOverview({
  projectId,
  rules,
  contexts,
  skillRefs,
}: {
  projectId: string;
  rules: ProjectRuleRecord[];
  contexts: ProjectContextRecord[];
  skillRefs: ProjectSkillReferenceRecord[];
}) {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-8 py-6">
      <p className="mb-6 max-w-xl text-xs text-ink-400">
        Project-level metadata. Rules, context snippets, and skill references
        are persisted here so future AI-assist flows can consume them as
        constraints and background knowledge.
      </p>
      <div className="grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-3">
        <Section title="Rules">
          <CreateRuleForm projectId={projectId} />
          <div className="mt-3">
            <RuleList rules={rules} />
          </div>
        </Section>
        <Section title="Context">
          <CreateContextForm projectId={projectId} />
          <div className="mt-3">
            <ContextList contexts={contexts} />
          </div>
        </Section>
        <Section title="Skill references">
          <CreateSkillReferenceForm projectId={projectId} />
          <div className="mt-3">
            <SkillReferenceList skillRefs={skillRefs} />
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col rounded-lg border border-ink-800 bg-ink-900 p-4">
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-ink-300">
        {title}
      </h2>
      {children}
    </section>
  );
}
