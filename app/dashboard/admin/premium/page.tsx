import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { Crown, Sparkles } from "lucide-react";
import { PremiumPlansClient } from "./PremiumPlansClient";

export default async function AdminPremiumPage() {
  await verifyAdmin();

  const [plans, features] = await Promise.all([
    prisma.premiumPlan.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        features: { include: { feature: true } },
      },
    }),
    prisma.premiumFeature.findMany({
      orderBy: { category: "asc" },
    }),
  ]);

  return (
    <main className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300">
          <Crown size={20} />
        </div>
        <div>
          <h1 className="font-display font-semibold text-xl text-text-primary">
            Premium & Paket
          </h1>
          <p className="text-sm text-text-tertiary">
            Kelola paket, harga, dan fitur premium — sepenuhnya dari sini, tanpa ubah kode.
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-purple flex-shrink-0 mt-0.5" />
        <p className="text-xs text-text-secondary leading-relaxed">
          Setiap fitur di bawah dapat dipindahkan antar paket. Mengubah fitur dari
          Premium ke Free (atau sebaliknya) langsung berlaku ke semua user — tidak
          perlu deploy ulang.
        </p>
      </div>

      <PremiumPlansClient initialPlans={plans} allFeatures={features} />
    </main>
  );
}
