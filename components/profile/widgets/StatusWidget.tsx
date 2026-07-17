"use client";

/**
 * components/profile/widgets/StatusWidget.tsx
 * Shows a custom user-written status. Separate from Discord status —
 * this is a simple text field set via dashboard, no real-time needed.
 */
export function StatusWidget({
  text,
  accentHex = "#9b6dff",
}: {
  text: string;
  accentHex?: string;
}) {
  return (
    <div className="glass-bright rounded-2xl px-4 py-3 flex items-center gap-3">
      <span
        className="h-2 w-2 rounded-full flex-shrink-0 animate-pulse-dot"
        style={{ background: accentHex }}
      />
      <p className="text-sm text-text-secondary font-mono leading-snug">{text}</p>
    </div>
  );
}
