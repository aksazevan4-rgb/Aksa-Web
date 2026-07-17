import { verifyAdmin } from "@/lib/dal";
import { Star } from "lucide-react";
import Link from "next/link";

/**
 * app/dashboard/admin/showcase/page.tsx
 *
 * The AKSA.ID showcase is controlled via the SiteConfig record, which is
 * managed from the Global Config page (/dashboard/admin/config). This page
 * is a redirect / pointer page so admins don't miss the setting.
 */
export default async function AdminShowcasePage() {
  await verifyAdmin();

  return (
    <main className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300">
          <Star size={20} />
        </div>
        <div>
          <h1 className="font-display font-semibold text-xl text-text-primary">
            Showcase Manager
          </h1>
          <p className="text-sm text-text-tertiary">
            Kelola apa yang dipromosikan di dalam platform AKSA.
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">AKSA.ID Showcase</h3>
        <p className="text-sm text-text-secondary leading-relaxed">
          Pengaturan promosi AKSA.ID (toggle tampil/sembunyi, URL Discord, deskripsi)
          dikelola dari halaman{" "}
          <Link href="/dashboard/admin/config" className="text-purple hover:underline">
            Konfigurasi Global
          </Link>
          . Desain ini sengaja dibuat begitu supaya branding AKSA sebagai platform
          dan AKSA.ID sebagai project tetap terpisah jelas.
        </p>

        <div className="rounded-xl border border-border bg-white/3 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <p className="text-xs font-medium text-text-primary">Yang dikontrol dari Config:</p>
          </div>
          <ul className="space-y-1 ml-4 text-xs text-text-secondary">
            <li>• Toggle tampil/sembunyi AKSA.ID showcase di home page</li>
            <li>• URL Discord resmi AKSA.ID</li>
            <li>• Deskripsi AKSA.ID yang ditampilkan di home page</li>
            <li>• Link sosial footer platform (berbeda dari link AKSA.ID)</li>
          </ul>
        </div>

        <Link
          href="/dashboard/admin/config"
          className="inline-flex items-center gap-2 rounded-xl bg-purple/10 border border-purple/25 px-4 py-2.5 text-sm font-medium text-purple hover:bg-purple/15 transition-colors"
        >
          Buka Konfigurasi Global →
        </Link>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">
          Showcase Lain (Coming Soon)
        </h3>
        <p className="text-sm text-text-secondary leading-relaxed">
          Di masa depan, admin dapat mengelola featured profiles, partner projects, dan
          konten showcase lain dari halaman ini. Ini akan menggunakan model database
          terpisah agar lebih fleksibel dari sekadar config field.
        </p>
      </div>
    </main>
  );
}
