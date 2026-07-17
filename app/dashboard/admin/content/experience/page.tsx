import Link from "next/link";
import { ArrowLeft, Briefcase } from "lucide-react";
import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { ExperienceClient } from "./ExperienceClient";

export default async function AdminExperiencePage() {
  await verifyAdmin();

  const entries = await prisma.experience.findMany({
    orderBy: { order: "asc" },
  });

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
          <Briefcase size={18} />
        </div>
        <div>
          <h1 className="font-display font-semibold text-xl text-text-primary">
            Kelola Riwayat Pengalaman
          </h1>
          <p className="text-sm text-text-secondary">
            Timeline karir/proyek yang tampil di homepage
          </p>
        </div>
      </div>

      <ExperienceClient
        entries={entries.map((e: (typeof entries)[number]) => ({
          id: e.id,
          role: e.role,
          company: e.company,
          startDate: e.startDate,
          endDate: e.endDate,
          current: e.current,
          description: e.description,
          order: e.order,
        }))}
      />
    </div>
  );
}
