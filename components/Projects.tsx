import { prisma } from "@/lib/prisma";
import ProjectsView from "@/components/ProjectsView";

export default async function Projects() {
  const projects = await prisma.project.findMany({
    orderBy: [{ featured: "desc" }, { order: "asc" }],
    include: {
      coverMedia: { select: { url: true } },
    },
  });

  return (
    <ProjectsView
      projects={projects.map((p: (typeof projects)[number]) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        status: p.status,
        tags: p.tags,
        repoUrl: p.repoUrl,
        url: p.url,
        coverUrl: p.coverMedia?.url ?? null,
        featured: p.featured,
      }))}
    />
  );
}
