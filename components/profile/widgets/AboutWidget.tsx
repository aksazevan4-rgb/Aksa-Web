"use client";

/**
 * components/profile/widgets/AboutWidget.tsx
 * Simple bio card widget — shown when 'about' widget is enabled.
 */
export function AboutWidget({ bio }: { bio: string }) {
  return (
    <div className="glass rounded-2xl px-5 py-4">
      <p className="text-sm text-text-secondary leading-relaxed">{bio}</p>
    </div>
  );
}
