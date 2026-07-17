/**
 * app/og/route.tsx
 *
 * Dynamic Open Graph image for public profile pages.
 * Usage (in [username]/page.tsx generateMetadata):
 *
 *   openGraph: {
 *     images: [`${config.siteUrl}/og?username=${user.username}`],
 *   }
 *
 * Uses Next.js ImageResponse (built-in, no extra package needed in Next 13+).
 */

import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getPlanLabel } from "@/lib/premium";
import type { OgDataResponse } from "@/app/api/internal/og-data/route";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");

  const dataUrl = new URL("/api/internal/og-data", req.nextUrl.origin);
  if (username) dataUrl.searchParams.set("username", username);

  const res = await fetch(dataUrl, { cache: "no-store" });
  const { siteName, siteDescription, user }: OgDataResponse = await res.json();

  if (!username || !user) {
    return defaultOg(siteName, siteDescription);
  }

  const planLabel = getPlanLabel({
    role: user.role,
    plan: user.plan,
    isFounder: user.isFounder,
  });

  const ACCENT = "#9b6dff";

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #07070f 0%, #141424 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid pattern overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(155,109,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(155,109,255,0.06) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Ambient glow */}
        <div
          style={{
            position: "absolute",
            top: -100,
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(155,109,255,0.25), transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            gap: 24,
            padding: "40px 80px",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              border: `3px solid ${ACCENT}50`,
              background: `${ACCENT}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
              color: "white",
              overflow: "hidden",
            }}
          >
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              (user.name ?? user.username ?? "?").charAt(0).toUpperCase()
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <h1
              style={{
                fontSize: 56,
                fontWeight: 700,
                color: "white",
                margin: 0,
                letterSpacing: "-1px",
              }}
            >
              {user.name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24, color: "rgba(255,255,255,0.5)" }}>
                @{user.username}
              </span>
              <span
                style={{
                  fontSize: 16,
                  color: ACCENT,
                  background: `${ACCENT}20`,
                  border: `1px solid ${ACCENT}40`,
                  borderRadius: 100,
                  padding: "4px 14px",
                }}
              >
                {planLabel}
              </span>
            </div>
          </div>

          {user.bio && (
            <p
              style={{
                fontSize: 22,
                color: "rgba(255,255,255,0.55)",
                textAlign: "center",
                maxWidth: 700,
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              {user.bio.length > 100 ? `${user.bio.slice(0, 97)}...` : user.bio}
            </p>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "18px 40px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span style={{ fontSize: 18, color: "rgba(255,255,255,0.35)" }}>
            {siteName}
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

function defaultOg(siteName: string, description: string) {
  const ACCENT = "#9b6dff";
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #07070f, #141424)",
          fontFamily: "sans-serif",
          gap: 20,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${ACCENT}30, transparent 70%)`,
            filter: "blur(60px)",
          }}
        />
        <h1 style={{ fontSize: 80, fontWeight: 800, color: "white", margin: 0, position: "relative" }}>
          {siteName}
        </h1>
        <p style={{ fontSize: 28, color: "rgba(255,255,255,0.5)", maxWidth: 700, textAlign: "center", position: "relative" }}>
          {description}
        </p>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
