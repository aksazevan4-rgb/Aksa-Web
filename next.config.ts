import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,

  experimental: {
    serverActions: {
      bodySizeLimit: "500mb",
    },
  },

  images: {
    remotePatterns: [
      new URL("https://avatars.githubusercontent.com/**"),
      new URL("https://lh3.googleusercontent.com/**"),
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // docs/16-performance-security.md §7 — security headers dasar. Sengaja
  // TIDAK termasuk Content-Security-Policy ketat di sini: CSP yang aman
  // butuh audit menyeluruh terhadap semua inline style/script (Tailwind,
  // Framer Motion, widget custom-html yang di-sandbox iframe, dst) supaya
  // tidak diam-diam merusak fitur yang sudah jalan — itu pekerjaan
  // terpisah yang butuh testing manual, bukan tebakan.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;