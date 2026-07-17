import Link from "next/link";
import { ArrowLeft, Network } from "lucide-react";
import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { EcosystemClient } from "./EcosystemClient";

export default async function AdminEcosystemPage() {
  await verifyAdmin();

  const nodes = await prisma.ecosystemNode.findMany({
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
          <Network size={18} />
        </div>
        <div>
          <h1 className="font-display font-semibold text-xl text-text-primary">
            Kelola Ecosystem Nodes
          </h1>
          <p className="text-sm text-text-secondary">
            Muncul di status strip Hero homepage
          </p>
        </div>
      </div>

      <EcosystemClient
        nodes={nodes.map((n: (typeof nodes)[number]) => ({
          id: n.id,
          name: n.name,
          description: n.description,
          status: n.status,
          url: n.url,
          order: n.order,
        }))}
      />
    </div>
  );
}
