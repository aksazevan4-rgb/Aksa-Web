import type { Metadata } from "next";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
// Profile Font System — one weight-set each, selectable per-profile via
// lib/profile-themes.ts PROFILE_FONTS. Importing the CSS registers the
// @font-face rule; the actual .woff2 file is only fetched by a visitor's
// browser if a rendered element actually uses that font-family, so this
// doesn't cost anything for profiles that don't pick these.
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/outfit/400.css";
import "@fontsource/outfit/600.css";
import "@fontsource/outfit/700.css";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/sora/400.css";
import "@fontsource/sora/600.css";
import "@fontsource/sora/700.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/syne/600.css";
import "@fontsource/syne/700.css";
import "./globals.css";
import "./globals-additions.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getSiteConfig } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: {
      default: config.siteTitle,
      template: `%s · ${config.siteName}`,
    },
    description: config.siteDescription,
    openGraph: {
      title: config.siteTitle,
      description: config.siteDescription,
      siteName: config.siteName,
    },
    metadataBase: new URL(config.siteUrl),
  };
}

// Injected before React hydrates to prevent theme flash.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var raw = localStorage.getItem("aksa-theme");
    var mode, accent, customHex;
    if (raw) {
      var saved = JSON.parse(raw);
      mode = saved.mode; accent = saved.accent; customHex = saved.customHex;
    } else {
      function readCookie(name) {
        var m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
        return m ? decodeURIComponent(m[1]) : null;
      }
      mode = readCookie("aksa-theme-mode");
      accent = readCookie("aksa-theme-accent");
      customHex = readCookie("aksa-theme-hex");
    }
    var resolved = mode;
    if (mode === "system" || !mode) {
      resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    document.documentElement.setAttribute("data-theme", resolved || "dark");
    if (accent === "custom" && customHex) {
      document.documentElement.style.setProperty("--accent", customHex);
    } else {
      document.documentElement.setAttribute("data-accent", accent || "purple");
    }
  } catch (e) {}
})();
`;


export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
          __html: THEME_INIT_SCRIPT,
        }}
        />
      </head>
      <body
        className="min-h-full flex flex-col bg-bg text-text-primary font-body"
        suppressHydrationWarning
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
