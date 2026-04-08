import { notFound } from "next/navigation";
import { Shell } from "@/components/shell/Shell";
import { getProject } from "@/server/projects";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  return <Shell projectId={id} />;
}
