import Link from "next/link";
import { ArrowLeft, UserCircle } from "lucide-react";
import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { AboutForm } from "./AboutForm";

export default async function AdminAboutPage() {
  await verifyAdmin();

  const profile = await prisma.profile.findUnique({
    where: { id: "profile" },
    include: { avatarMedia: { select: { url: true } } },
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
          <UserCircle size={18} />
        </div>
        <div>
          <h1 className="font-display font-semibold text-xl text-text-primary">
            Edit Profil About Me
          </h1>
          <p className="text-sm text-text-secondary">
            Konten ini tampil di section Hero dan About homepage
          </p>
        </div>
      </div>

      <AboutForm
        initial={{
          name: profile?.name ?? "",
          role: profile?.role ?? "",
          roles: profile?.roles ?? [],
          founderOf: profile?.founderOf ?? null,
          location: profile?.location ?? "",
          timezone: profile?.timezone ?? "",
          status: profile?.status ?? "",
          bioParagraphs: profile?.bioParagraphs ?? [],
          avatarUrl: profile?.avatarMedia?.url ?? null,
        }}
      />
    </div>
  );
}
