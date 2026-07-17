import Link from "next/link";
import { ArrowLeft, Layers } from "lucide-react";
import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { TechStackClient } from "./TechStackClient";

export default async function AdminTechStackPage() {
  await verifyAdmin();

  const items = await prisma.techItem.findMany({
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
          <Layers size={18} />
        </div>
        <div>
          <h1 className="font-display font-semibold text-xl text-text-primary">
            Kelola Tech Stack
          </h1>
          <p className="text-sm text-text-secondary">
            Muncul di section &quot;Tech Stack&quot; homepage
          </p>
        </div>
      </div>

      <TechStackClient
        items={items.map((t: (typeof items)[number]) => ({
          id: t.id,
          name: t.name,
          category: t.category,
          icon: t.icon,
          order: t.order,
        }))}
      />
    </div>
  );
}
