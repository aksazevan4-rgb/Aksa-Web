import Link from "next/link";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";

export interface CompletionItem {
  label: string;
  done: boolean;
  href: string;
}

export function ProfileCompletionCard({ items }: { items: CompletionItem[] }) {
  const doneCount = items.filter((i) => i.done).length;
  const pct = Math.round((doneCount / items.length) * 100);

  if (pct === 100) return null; // nothing to nudge once fully complete

  return (
    <div className="dash-panel rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple/10 border border-purple/20 text-purple">
            <Sparkles size={13} />
          </span>
          <p className="text-sm font-semibold text-text-primary">Lengkapi Profil</p>
        </div>
        <span className="text-xs font-medium text-purple tabular-nums">{pct}%</span>
      </div>

      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple to-blue transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-xs text-text-tertiary leading-relaxed">
        {doneCount} dari {items.length} langkah selesai — lengkapi supaya profilmu lebih mudah ditemukan.
      </p>

      <div className="space-y-1.5">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs transition-colors ${
              item.done
                ? "border-emerald-400/15 bg-emerald-400/5 text-emerald-300"
                : "border-border/70 text-text-secondary hover:bg-white/[0.04] hover:text-text-primary hover:border-purple/20"
            }`}
          >
            {item.done ? (
              <CheckCircle2 size={14} className="flex-shrink-0" />
            ) : (
              <Circle size={14} className="flex-shrink-0 text-text-tertiary" />
            )}
            <span className="flex-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
