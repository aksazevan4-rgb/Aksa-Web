import type { SecurityScoreResult } from "@/lib/security-score";
import { Check, X } from "lucide-react";

/**
 * app/dashboard/settings/SecurityScoreCard.tsx
 * docs/05-auth-system.md §5 — murni indikator edukatif, TIDAK menghukum
 * atau mengunci fitur apa pun berdasarkan skor ini.
 */
export function SecurityScoreCard({ result }: { result: SecurityScoreResult }) {
  const color =
    result.score >= 80 ? "text-emerald-300" : result.score >= 50 ? "text-amber-300" : "text-red-400";

  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-text-primary">Security Score</p>
        <span className={`font-display font-semibold text-lg ${color}`}>{result.score}/100</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            result.score >= 80 ? "bg-emerald-400" : result.score >= 50 ? "bg-amber-400" : "bg-red-400"
          }`}
          style={{ width: `${result.score}%` }}
        />
      </div>
      <ul className="space-y-1.5 pt-1">
        {result.factors.map((f) => (
          <li key={f.key} className="flex items-center gap-2 text-xs text-text-tertiary">
            {f.met ? (
              <Check size={13} className="text-emerald-400 flex-shrink-0" />
            ) : (
              <X size={13} className="text-text-tertiary flex-shrink-0" />
            )}
            <span className={f.met ? "text-text-secondary" : ""}>{f.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
