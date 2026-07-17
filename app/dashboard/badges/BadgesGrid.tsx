"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Clock, Loader2 } from "lucide-react";
import { BadgeCard } from "@/features/badges/components/BadgeCard";
import type { UserBadgeWithBadge } from "@/features/badges/types";
import {
  setEquippedBadgeAction,
  setFeaturedBadgeAction,
  purchaseBadgeAction,
} from "@/features/badges/server/actions";

interface Props {
  userBadges: UserBadgeWithBadge[];
  discordUrl: string | null;
}

/** Per-badge extra context that doesn't fit the generic BadgeCard —
 * only meaningful for a handful of special keys, same behavior as the
 * legacy hardcoded action list this replaces. */
function specialAction(
  userBadge: UserBadgeWithBadge,
  discordUrl: string | null
): { href: string; label: string } | null {
  const { badge, unlockedAt } = userBadge;
  if (unlockedAt) return null;

  if ((badge.key === "helper" || badge.key === "server_booster") && discordUrl) {
    return { href: discordUrl, label: "Join Discord" };
  }
  if (badge.key === "premium") {
    return { href: "/dashboard/settings#premium", label: "Upgrade ke Premium" };
  }
  return null;
}

export function BadgesGrid({ userBadges, discordUrl }: Props) {
  const [items, setItems] = useState(userBadges);
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function updateLocal(badgeId: string, patch: Partial<UserBadgeWithBadge>) {
    setItems((prev) =>
      prev.map((ub) => (ub.badgeId === badgeId ? { ...ub, ...patch } : ub))
    );
  }

  function handleEquip(userBadge: UserBadgeWithBadge) {
    const next = !userBadge.equipped;
    updateLocal(userBadge.badgeId, { equipped: next });
    startTransition(() => {
      void setEquippedBadgeAction({ badgeId: userBadge.badgeId, equipped: next });
    });
  }

  function handleFeature(userBadge: UserBadgeWithBadge) {
    const next = !userBadge.featured;
    updateLocal(userBadge.badgeId, { featured: next });
    startTransition(() => {
      void setFeaturedBadgeAction({ badgeId: userBadge.badgeId, featured: next });
    });
  }

  function handlePurchase(userBadge: UserBadgeWithBadge) {
    setPendingId(userBadge.badgeId);
    setErrors((e) => ({ ...e, [userBadge.badgeId]: "" }));
    startTransition(async () => {
      const result = await purchaseBadgeAction(userBadge.badgeId);
      setPendingId(null);
      if (!result.success) {
        setErrors((e) => ({ ...e, [userBadge.badgeId]: result.error }));
        return;
      }
      updateLocal(userBadge.badgeId, { unlockedAt: new Date(), progress: 100 });
    });
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((userBadge) => {
        const { badge, unlockedAt } = userBadge;
        const isUnlocked = Boolean(unlockedAt);
        const isOwnedRecord = userBadge.id !== `virtual:${badge.id}`;
        const action = specialAction(userBadge, discordUrl);

        return (
          <div key={badge.id} className="space-y-2">
            <BadgeCard
              userBadge={userBadge}
              // Real UserBadge rows support equip/feature; badges that are
              // only "earned" live (e.g. computed from plan/account age,
              // never materialized in the DB) don't have anything to
              // toggle against yet.
              onEquipToggle={
                isUnlocked && isOwnedRecord ? () => handleEquip(userBadge) : undefined
              }
              onFeatureToggle={
                isUnlocked && isOwnedRecord ? () => handleFeature(userBadge) : undefined
              }
            />

            {!isUnlocked && action && (
              <Link
                href={action.href}
                target={action.href.startsWith("http") ? "_blank" : undefined}
                className="inline-flex items-center rounded-lg border border-border px-2.5 py-1 text-[11px] text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
              >
                {action.label}
              </Link>
            )}

            {!isUnlocked && !action && badge.isPurchasable && badge.priceCredits && (
              <button
                type="button"
                disabled={isPending && pendingId === badge.id}
                onClick={() => handlePurchase(userBadge)}
                className="inline-flex items-center gap-1 rounded-lg border border-purple/30 bg-purple/10 px-2.5 py-1 text-[11px] text-purple hover:bg-purple/15 transition-colors disabled:opacity-50"
              >
                {isPending && pendingId === badge.id ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <Clock size={11} />
                )}
                Beli — {badge.priceCredits} Credits
              </button>
            )}

            {errors[badge.id] && (
              <p className="text-[11px] text-red-400">{errors[badge.id]}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
