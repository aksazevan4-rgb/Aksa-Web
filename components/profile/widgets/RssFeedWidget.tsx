/**
 * components/profile/widgets/RssFeedWidget.tsx
 *
 * Presentational only — TIDAK fetch di sini. Widget ini dirender dari
 * dalam ExtraWidgets.tsx yang "use client", dan async Server Component
 * tidak bisa langsung diimpor ke Client Component (batasan arsitektur
 * React Server Components). Fetch & parsing dilakukan di
 * app/[username]/page.tsx (Server Component) lewat fetchFeedTitles yang
 * diekspor di bawah, hasilnya diteruskan sebagai prop biasa.
 *
 * CATATAN JUJUR: parsing di fetchFeedTitles pakai regex sederhana untuk
 * tag <title>, bukan XML parser penuh — cukup untuk RSS 2.0 standar,
 * TIDAK menjamin kompatibilitas penuh dengan semua varian Atom/RSS yang
 * ada di luar sana. Kalau parsing gagal, fungsi ini return array kosong
 * (docs/02 §7: satu widget gagal tidak boleh menjatuhkan seluruh halaman).
 */

export async function fetchFeedTitles(feedUrl: string): Promise<string[]> {
  try {
    const res = await fetch(feedUrl, {
      next: { revalidate: 900 }, // 15 menit — feed tidak perlu realtime
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const titleMatches = [...xml.matchAll(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/gs)];

    // Entri pertama biasanya judul channel/feed itu sendiri, bukan artikel —
    // dilewati.
    return titleMatches
      .slice(1, 6)
      .map((m) => m[1].trim())
      .filter(Boolean);
  } catch (error) {
    console.error("[RSS_FEED_WIDGET_ERROR]", error);
    return [];
  }
}

export function RssFeedWidget({ titles }: { titles: string[] }) {
  if (titles.length === 0) return null;

  return (
    <div className="glass-bright rounded-2xl p-4 space-y-2">
      <p className="text-xs text-text-secondary font-medium">Artikel Terbaru</p>
      <ul className="space-y-1.5">
        {titles.map((title, i) => (
          <li key={i} className="text-sm text-text-primary truncate">
            {title}
          </li>
        ))}
      </ul>
    </div>
  );
}
