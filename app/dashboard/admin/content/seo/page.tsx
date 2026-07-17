import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { SeoForm } from "./SeoForm";

export default async function AdminSeoPage() {
  await verifyAdmin();

  const settings = await prisma.settings.findUnique({
    where: { id: "settings" },
    include: { ogImageMedia: { select: { url: true } } },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/admin/content"
          className="h-9 w-9 flex items-center justify-center rounded-xl glass text-text-tertiary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="h-10 w-10 rounded-xl bg-purple/10 border border-purple/20 flex items-center justify-center text-purple">
          <Search size={18} />
        </div>
        <div>
          <h1 className="font-display font-semibold text-xl text-text-primary">
            Pengaturan SEO
          </h1>
          <p className="text-sm text-text-secondary">
            Metadata website dan link sosial media
          </p>
        </div>
      </div>

      <SeoForm
        initial={{
          siteTitle: settings?.siteTitle ?? "",
          siteDescription: settings?.siteDescription ?? "",
          ogImageUrl: settings?.ogImageMedia?.url ?? null,
          socialGithub: settings?.socialGithub ?? null,
          socialDiscord: settings?.socialDiscord ?? null,
          socialWebsite: settings?.socialWebsite ?? null,
          socialSaweria: settings?.socialSaweria ?? null,
          socialYoutube: settings?.socialYoutube ?? null,
          socialTiktok: settings?.socialTiktok ?? null,
          socialInstagram: settings?.socialInstagram ?? null,
          socialBagibagi: settings?.socialBagibagi ?? null,
          aksaIdDiscordUrl: settings?.aksaIdDiscordUrl ?? null,
        }}
      />
    </div>
  );
}
