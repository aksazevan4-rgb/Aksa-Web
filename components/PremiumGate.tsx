/**
 * components/PremiumGate.tsx
 *
 * Server component gate that checks a specific feature key against the
 * database-driven PremiumPlan/PremiumFeature system.
 *
 * Replaces the old hardcoded `plan === "PREMIUM"` check entirely.
 *
 * Usage (server component):
 *   <PremiumGate featureKey="video_background" userPlan={user.plan} userRole={user.role}>
 *     <VideoBackgroundPicker />
 *   </PremiumGate>
 *
 * Shows children when access is granted, otherwise shows the upgrade prompt.
 * Pass `fallback` prop to override the default upgrade prompt.
 */

import Link from "next/link";
import { Crown } from "lucide-react";
import { hasFeatureAccess, type FeatureKey } from "@/lib/premium-features";

interface Props {
  featureKey: FeatureKey;
  userPlan: string;
  userRole: string;
  children: React.ReactNode;
  /** Custom fallback rendered when access is denied. */
  fallback?: React.ReactNode;
  /** If true, renders nothing (no fallback UI) when access denied. */
  silent?: boolean;
}

export async function PremiumGate({
  featureKey,
  userPlan,
  userRole,
  children,
  fallback,
  silent = false,
}: Props) {
  const allowed = await hasFeatureAccess({ plan: userPlan, role: userRole }, featureKey);

  if (allowed) return <>{children}</>;

  if (silent) return null;

  if (fallback) return <>{fallback}</>;

  return (
    <div className="glass rounded-2xl p-5 flex items-center gap-4">
      <div className="h-10 w-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300 flex-shrink-0">
        <Crown size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary">Fitur Premium</p>
        <p className="text-xs text-text-tertiary mt-0.5">
          Fitur ini membutuhkan upgrade ke Premium.
        </p>
      </div>
      <Link
        href="/dashboard/settings#premium"
        className="flex-shrink-0 rounded-xl bg-purple/10 border border-purple/25 px-3 py-2 text-xs font-medium text-purple hover:bg-purple/15 transition-colors"
      >
        Upgrade
      </Link>
    </div>
  );
}

/**
 * Inline badge variant — just shows a Crown icon next to locked content labels.
 * Use inside layout pickers, background pickers, etc.
 */
export function PremiumBadge({ size = 12 }: { size?: number }) {
  return (
    <Crown
      size={size}
      className="text-amber-300 flex-shrink-0"
      aria-label="Fitur Premium"
    />
  );
}
