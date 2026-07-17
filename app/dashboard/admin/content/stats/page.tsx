import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { StatsClient } from "./StatsClient";

export default async function AdminStatsPage() {
  await verifyAdmin();

  const stats = await prisma.stat.findMany({ orderBy: { order: "asc" } });

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
          <BarChart3 size={18} />
        </div>
        <div>
          <h1 className="font-display font-semibold text-xl text-text-primary">
            Kelola Statistik
          </h1>
          <p className="text-sm text-text-secondary">
            Angka pencapaian yang tampil di homepage
          </p>
        </div>
      </div>

      <StatsClient
        stats={stats.map((s: (typeof stats)[number]) => ({
          id: s.id,
          label: s.label,
          value: s.value,
          order: s.order,
        }))}
      />
    </div>
  );
}
