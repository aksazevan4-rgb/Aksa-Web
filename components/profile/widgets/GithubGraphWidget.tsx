/**
 * components/profile/widgets/GithubGraphWidget.tsx
 *
 * CATATAN JUJUR: GitHub tidak punya REST API publik tanpa autentikasi untuk
 * grafik kontribusi (butuh GraphQL API + personal access token, yang berarti
 * tiap pemilik profil harus punya token GitHub sendiri — kompleksitas yang
 * tidak sepadan untuk widget dekoratif). Sebagai gantinya dipakai layanan
 * gambar publik pihak ketiga (ghchart.rshah.org) yang men-generate SVG
 * grafik kontribusi dari data publik GitHub tanpa token. Ini Server
 * Component murni (bukan client), jadi tidak butuh fetch/loading state —
 * cukup <img> yang di-render browser pengunjung.
 */
export function GithubGraphWidget({ username }: { username: string }) {
  if (!username) return null;

  return (
    <div className="glass-bright rounded-2xl p-4 space-y-2">
      <p className="text-xs text-text-secondary font-medium">GitHub — @{username}</p>
      {/* eslint-disable-next-line @next/next/no-img-element -- SVG dinamis pihak ketiga, bukan aset next/image */}
      <img
        src={`https://ghchart.rshah.org/9b6dff/${encodeURIComponent(username)}`}
        alt={`Grafik kontribusi GitHub ${username}`}
        className="w-full rounded-lg"
        loading="lazy"
      />
    </div>
  );
}
