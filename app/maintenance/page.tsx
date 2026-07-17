import { getSiteConfig } from "@/lib/site-config";
import { Wrench } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return { title: `Maintenance · ${config.siteName}` };
}

export default async function MaintenancePage() {
  const config = await getSiteConfig();

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-bg">
      <div className="text-center space-y-5 max-w-sm">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300">
          <Wrench size={28} />
        </div>

        <div>
          <h1 className="font-display font-bold text-2xl text-text-primary">
            {config.siteName} sedang maintenance
          </h1>
          <p className="mt-2 text-sm text-text-secondary leading-relaxed">
            Kami sedang melakukan pembaruan. Platform akan kembali normal dalam
            beberapa saat. Terima kasih atas kesabaranmu.
          </p>
        </div>

        {config.aksaIdDiscordUrl && (
          <a
            href={config.aksaIdDiscordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#5865f2]/15 border border-[#5865f2]/30 px-5 py-2.5 text-sm font-medium text-[#7289da] hover:bg-[#5865f2]/20 transition-colors"
          >
            Info terbaru di Discord →
          </a>
        )}
      </div>
    </main>
  );
}
