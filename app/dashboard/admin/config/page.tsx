import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { Settings } from "lucide-react";
import { SiteConfigForm } from "./SiteConfigForm";

export default async function AdminConfigPage() {
  await verifyAdmin();

  let config = await prisma.siteConfig.findUnique({ where: { id: "config" } });

  if (!config) {
    config = await prisma.siteConfig.create({ data: { id: "config" } });
  }

  return (
    <main className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-white/5 border border-border flex items-center justify-center text-text-secondary">
          <Settings size={20} />
        </div>
        <div>
          <h1 className="font-display font-semibold text-xl text-text-primary">
            Konfigurasi Global
          </h1>
          <p className="text-sm text-text-tertiary">
            Pengaturan platform yang berlaku di seluruh website.
          </p>
        </div>
      </div>

      <SiteConfigForm initial={config} />
    </main>
  );
}
