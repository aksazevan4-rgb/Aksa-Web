"use client";

import { useState, useTransition } from "react";
import { reactToProfile } from "@/app/[username]/public-actions";

const EMOJIS = ["👍", "❤️", "🔥", "😂", "👀"] as const;

interface Props {
  userId: string;
  initialCounts: Record<string, number>;
}

export function ReactionsWidget({ userId, initialCounts }: Props) {
  const [counts, setCounts] = useState<Record<string, number>>(initialCounts);
  const [reactedWith, setReactedWith] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(`reacted:${userId}`);
  });
  const [, startTransition] = useTransition();

  function handleReact(emoji: string) {
    if (reactedWith) return; // one reaction per visitor per profile (soft, client-side)

    setCounts((prev) => ({ ...prev, [emoji]: (prev[emoji] ?? 0) + 1 }));
    setReactedWith(emoji);
    try {
      window.localStorage.setItem(`reacted:${userId}`, emoji);
    } catch {
      // localStorage unavailable (private browsing, etc) — still let the
      // click through, just without persisting the dedupe flag.
    }

    startTransition(async () => {
      const result = await reactToProfile(userId, emoji);
      if (result.counts) setCounts(result.counts);
    });
  }

  return (
    <div className="glass rounded-2xl p-4 flex items-center justify-center gap-2 flex-wrap">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => handleReact(emoji)}
          disabled={Boolean(reactedWith)}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all ${
            reactedWith === emoji
              ? "border-purple/50 bg-purple/10 scale-105"
              : "border-border bg-white/5 hover:bg-white/10"
          } ${reactedWith && reactedWith !== emoji ? "opacity-50" : ""}`}
        >
          <span>{emoji}</span>
          <span className="text-[11px] text-text-tertiary tabular-nums">
            {counts[emoji] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}
