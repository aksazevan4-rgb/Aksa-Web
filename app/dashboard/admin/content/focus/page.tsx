import Link from "next/link";
import { ArrowLeft, Target } from "lucide-react";
import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { FocusClient } from "./FocusClient";

export default async function AdminFocusPage() {
  await verifyAdmin();

  const items = await prisma.focusItem.findMany({ orderBy: { order: "asc" } });

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
          <Target size={18} />
        </div>
        <div>
          <h1 className="font-display font-semibold text-xl text-text-primary">
            Kelola Focus Items
          </h1>
          <p className="text-sm text-text-secondary">
            &quot;Sedang Dikerjakan&quot; di homepage
          </p>
        </div>
      </div>

      <FocusClient
        items={items.map((f: (typeof items)[number]) => ({
          id: f.id,
          title: f.title,
          description: f.description,
          icon: f.icon,
          order: f.order,
        }))}
      />
    </div>
  );
}
