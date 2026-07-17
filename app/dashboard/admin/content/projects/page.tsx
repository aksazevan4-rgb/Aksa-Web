import Link from "next/link";
import { ArrowLeft, FolderKanban } from "lucide-react";
import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { ProjectsClient } from "./ProjectsClient";
import type { ProjectFormData } from "./ProjectForm";

export default async function AdminProjectsPage() {
  await verifyAdmin();

  const projects = await prisma.project.findMany({
    orderBy: { order: "asc" },
    include: {
      coverMedia: { select: { url: true } },
    },
  });

  const formData: ProjectFormData[] = projects.map((p: (typeof projects)[number]) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    status: p.status,
    tags: p.tags,
    repoUrl: p.repoUrl,
    url: p.url,
    coverUrl: p.coverMedia?.url ?? null,
    order: p.order,
    featured: p.featured,
  }));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/admin/content"
          className="h-9 w-9 flex items-center justify-center rounded-xl glass text-text-tertiary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="h-10 w-10 rounded-xl bg-purple/10 border border-purple/20 flex items-center justify-center text-purple">
          <FolderKanban size={18} />
        </div>
        <div>
          <h1 className="font-display font-semibold text-xl text-text-primary">
            Kelola Projects
          </h1>
          <p className="text-sm text-text-secondary">
            Drag untuk mengurutkan, klik ikon pensil untuk mengubah detail
          </p>
        </div>
      </div>

      <ProjectsClient projects={formData} />
    </div>
  );
}
