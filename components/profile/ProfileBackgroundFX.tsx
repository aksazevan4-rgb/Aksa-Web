interface Props {
  /** Deliberately `string`, not BackgroundType — mirrors ProfileLayoutProps.background, since this ultimately comes from a JSON DB column with no runtime guarantee. Unrecognized values just fall through to the `return null` at the end. */
  type: string;
  colors?: string[];
  accentHex: string;
  /** Image/video media URL — only used when type is "image" or "video". */
  mediaUrl?: string;
}

// Fixed, hand-placed positions rather than Math.random() — this renders on
// the server (public profile page is an RSC), and random values would
// differ between the server render and the client hydration pass, which
// React flags as a hydration mismatch. Deterministic values sidestep that
// entirely while still reading as "scattered" rather than a visible grid.
const PARTICLE_SPOTS = [
  { left: "8%", top: "18%", size: 3, delay: "0s" },
  { left: "22%", top: "72%", size: 4, delay: "0.8s" },
  { left: "35%", top: "35%", size: 2, delay: "1.6s" },
  { left: "48%", top: "80%", size: 3, delay: "0.4s" },
  { left: "58%", top: "15%", size: 5, delay: "2.1s" },
  { left: "68%", top: "55%", size: 2, delay: "1.1s" },
  { left: "76%", top: "25%", size: 4, delay: "2.8s" },
  { left: "85%", top: "68%", size: 3, delay: "0.2s" },
  { left: "14%", top: "48%", size: 2, delay: "1.9s" },
  { left: "92%", top: "40%", size: 3, delay: "1.3s" },
  { left: "40%", top: "10%", size: 2, delay: "2.4s" },
  { left: "62%", top: "88%", size: 4, delay: "0.6s" },
];

/**
 * components/profile/ProfileBackgroundFX.tsx
 *
 * Decorative layer for background types that need actual DOM elements
 * (blurred blobs, a star field, floating dots) rather than a single CSS
 * `background` value — those live in getBackgroundStyle() in
 * lib/profile-themes.ts instead and don't need this component at all.
 * Drop right after a layout's <main> opens; fixed + inset-0 + z-0 so it
 * sits behind the actual `relative z-10`-ish content without needing every
 * layout to restructure its own stacking.
 */
export function ProfileBackgroundFX({ type, colors, accentHex, mediaUrl }: Props) {
  const c1 = colors?.[0] ?? accentHex;
  const c2 = colors?.[1] ?? accentHex;

  if (type === "video" && mediaUrl) {
    return (
      <div className="profile-bg-media" aria-hidden>
        <video
          className="profile-bg-media__el"
          src={mediaUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        <div className="profile-bg-media__vignette" />
      </div>
    );
  }

  if (type === "image" && mediaUrl) {
    // backgroundStyle already paints this as a CSS background-image (works
    // without JS), but we still overlay the vignette here so text stays
    // readable regardless of the underlying photo's brightness.
    return (
      <div className="profile-bg-media" aria-hidden>
        <div className="profile-bg-media__vignette" />
      </div>
    );
  }

  if (type === "aurora") {
    return (
      <div className="profile-bg-fx" aria-hidden>
        <div
          className="profile-bg-fx__blob"
          style={{ left: "-10%", top: "-15%", width: "55%", height: "55%", background: c1, opacity: 0.35 }}
        />
        <div
          className="profile-bg-fx__blob"
          style={{
            right: "-15%",
            top: "10%",
            width: "50%",
            height: "50%",
            background: c2,
            opacity: 0.28,
            animationDelay: "-5s",
            animationDuration: "18s",
          }}
        />
        <div
          className="profile-bg-fx__blob"
          style={{
            left: "20%",
            bottom: "-20%",
            width: "45%",
            height: "45%",
            background: c1,
            opacity: 0.22,
            animationDelay: "-9s",
            animationDuration: "16s",
          }}
        />
      </div>
    );
  }

  if (type === "neon") {
    return (
      <div className="profile-bg-fx" aria-hidden>
        <div
          className="profile-bg-fx__neon-blob"
          style={{ left: "-8%", top: "-10%", width: "40%", height: "40%", background: c1, opacity: 0.6 }}
        />
        <div
          className="profile-bg-fx__neon-blob"
          style={{
            right: "-10%",
            bottom: "-10%",
            width: "42%",
            height: "42%",
            background: c2,
            opacity: 0.55,
            animationDelay: "-2s",
          }}
        />
      </div>
    );
  }

  if (type === "galaxy") {
    // Two star layers at different tile sizes for a sense of depth, plus one
    // soft "nebula" glow so it doesn't read as flat dots on black.
    return (
      <div className="profile-bg-fx" aria-hidden>
        <div
          className="profile-bg-fx__blob"
          style={{ left: "10%", top: "20%", width: "50%", height: "50%", background: accentHex, opacity: 0.14, animationDuration: "22s" }}
        />
        <div
          className="profile-bg-fx__stars"
          style={{
            backgroundImage: "radial-gradient(1px 1px at 20% 30%, white, transparent), radial-gradient(1px 1px at 65% 15%, white, transparent), radial-gradient(1px 1px at 85% 60%, white, transparent), radial-gradient(1px 1px at 40% 80%, white, transparent), radial-gradient(1px 1px at 10% 70%, white, transparent)",
            backgroundSize: "180px 180px",
          }}
        />
        <div
          className="profile-bg-fx__stars"
          style={{
            backgroundImage: "radial-gradient(1.5px 1.5px at 30% 50%, white, transparent), radial-gradient(1.5px 1.5px at 75% 35%, white, transparent), radial-gradient(1.5px 1.5px at 55% 90%, white, transparent)",
            backgroundSize: "260px 260px",
            opacity: 0.6,
          }}
        />
      </div>
    );
  }

  if (type === "particles") {
    return (
      <div className="profile-bg-fx" aria-hidden>
        {PARTICLE_SPOTS.map((p, i) => (
          <div
            key={i}
            className="profile-bg-fx__particle"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              background: i % 2 === 0 ? accentHex : "#ffffff",
              animationDelay: p.delay,
              ["--particle-opacity" as string]: i % 3 === 0 ? "0.7" : "0.4",
            }}
          />
        ))}
      </div>
    );
  }

  return null;
}
