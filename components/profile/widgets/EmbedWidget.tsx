"use client";

export interface EmbedItem {
  url: string;
  label?: string;
}

interface Props {
  items: EmbedItem[];
  accentHex?: string;
}

/**
 * components/profile/widgets/EmbedWidget.tsx
 *
 * Deliberately does NOT put arbitrary user-supplied URLs into an <iframe src>.
 * An arbitrary-origin iframe on a public multi-tenant profile page is a
 * phishing/clickjacking vector (e.g. someone embeds a pixel-perfect fake
 * Discord/bank login inside their "embed" block to catch visitors). Instead
 * we only recognize a small allowlist of known embed providers and build
 * their *official* embed URL ourselves — anything else renders as a plain,
 * safe outbound link card instead of an iframe.
 *
 * Data stored in User.widgetConfig: { embed: { enabled: true, config: { items: EmbedItem[] } } }
 */

type Resolved =
  | { kind: "iframe"; src: string; aspect: "video" | "audio-tall" | "audio-wide" }
  | { kind: "link" };

function resolveEmbed(rawUrl: string): Resolved {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return { kind: "link" };
  }
  const host = url.hostname.replace(/^www\./, "");

  // YouTube
  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = url.searchParams.get("v");
    if (id) return { kind: "iframe", src: `https://www.youtube.com/embed/${id}`, aspect: "video" };
  }
  if (host === "youtu.be") {
    const id = url.pathname.slice(1);
    if (id) return { kind: "iframe", src: `https://www.youtube.com/embed/${id}`, aspect: "video" };
  }

  // Spotify (track/album/playlist/episode/show)
  if (host === "open.spotify.com") {
    const match = url.pathname.match(/^\/(track|album|playlist|episode|show)\/([A-Za-z0-9]+)/);
    if (match) {
      return { kind: "iframe", src: `https://open.spotify.com/embed/${match[1]}/${match[2]}`, aspect: "audio-wide" };
    }
  }

  // SoundCloud — official widget takes the original track URL as a query param
  if (host === "soundcloud.com") {
    const src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url.toString())}&color=%239b6dff&auto_play=false`;
    return { kind: "iframe", src, aspect: "audio-tall" };
  }

  // Figma
  if (host === "figma.com") {
    const src = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url.toString())}`;
    return { kind: "iframe", src, aspect: "video" };
  }

  return { kind: "link" };
}

const ASPECT_CLASS: Record<string, string> = {
  video: "aspect-video",
  "audio-tall": "h-[166px]",
  "audio-wide": "h-[152px]",
};

export function EmbedWidget({ items, accentHex = "#9b6dff" }: Props) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => {
        const resolved = resolveEmbed(item.url);
        if (resolved.kind === "iframe") {
          return (
            <div key={item.url + i} className="rounded-2xl overflow-hidden border border-border">
              <iframe
                src={resolved.src}
                className={`w-full ${ASPECT_CLASS[resolved.aspect]}`}
                frameBorder={0}
                allow="autoplay; encrypted-media; fullscreen; clipboard-write"
                loading="lazy"
                title={item.label ?? "Embed"}
              />
            </div>
          );
        }
        // Unrecognized provider — safe fallback, plain outbound link, no iframe.
        return (
          <a
            key={item.url + i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="flex items-center gap-3 rounded-2xl border border-border px-5 py-3.5 text-sm font-medium text-text-primary hover:border-purple/40 transition-colors"
            style={{ color: accentHex }}
          >
            {item.label || item.url}
          </a>
        );
      })}
    </div>
  );
}
