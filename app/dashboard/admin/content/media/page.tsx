import Link from "next/link";
import { ArrowLeft, HardDrive } from "lucide-react";
import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { MediaClient } from "./MediaClient";

export default async function AdminMediaPage() {
  await verifyAdmin();

  const media = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/admin/content"
          className="h-9 w-9 flex items-center justify-center rounded-xl glass text-text-tertiary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="h-10 w-10 rounded-xl bg-purple/10 border border-purple/20 flex items-center justify-center text-purple">
          <HardDrive size={18} />
        </div>
        <div>
          <h1 className="font-display font-semibold text-xl text-text-primary">
            Media Manager
          </h1>
          <p className="text-sm text-text-secondary">
            Semua file yang pernah diupload lewat avatar, banner, gallery, dst
          </p>
        </div>
      </div>

      <MediaClient
        media={media.map((m: (typeof media)[number]) => ({
          id: m.id,
          url: m.url,
          format: m.format,
          resourceType: m.resourceType,
          bytes: m.bytes,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
