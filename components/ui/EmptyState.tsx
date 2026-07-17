/**
 * components/ui/EmptyState.tsx
 *
 * Reusable empty state for dashboard lists/tables (no data yet, or a
 * search/filter returned nothing). Matches the glass + icon-badge pattern
 * already used ad-hoc in a few places (e.g. ProfileLinksClient) so every
 * list in the dashboard looks consistent instead of some showing a
 * polished empty state and others a single line of muted text.
 */

import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: ReactNode;
  /** Use "compact" inside tables/panels that already have their own
   * card/border chrome (skips the outer glass card + padding). */
  variant?: "card" | "compact";
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "card",
  className = "",
}: EmptyStateProps) {
  const wrapperClass =
    variant === "card"
      ? `glass rounded-2xl p-10 text-center space-y-3 ${className}`
      : `py-12 text-center space-y-3 ${className}`;

  return (
    <div className={wrapperClass}>
      <div className="mx-auto h-12 w-12 rounded-full bg-purple/10 border border-purple/20 flex items-center justify-center text-purple">
        <Icon size={20} />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-text-primary">{title}</p>
        {description && (
          <p className="text-xs text-text-tertiary max-w-xs mx-auto">
            {description}
          </p>
        )}
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
