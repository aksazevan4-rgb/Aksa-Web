/**
 * lib/premium.ts
 *
 * LEGACY COMPATIBILITY LAYER.
 *
 * Gunakan file ini hanya untuk compatibility lama
 * (badge, premium check sederhana, dll).
 *
 * Untuk feature gate gunakan:
 * lib/premium-features.ts
 */

export const FREE_LINK_LIMIT = 5;

export type PremiumCheckUser = {
  role: "ADMIN" | "USER";
  plan: "FREE" | "PREMIUM";
};

/**
 * Coarse premium check.
 * Admin selalu dianggap premium.
 */
export function hasPremiumAccess(user: PremiumCheckUser): boolean {
  return user.role === "ADMIN" || user.plan === "PREMIUM";
}

export type PlanLabelUser = {
  role: "ADMIN" | "USER";
  plan: "FREE" | "PREMIUM";
  isFounder: boolean;
};

export type PlanLabel =
  | "Founder"
  | "Admin"
  | "Premium"
  | "User";

export function getPlanLabel(user: PlanLabelUser): PlanLabel {
  if (user.isFounder) return "Founder";
  if (user.role === "ADMIN") return "Admin";
  if (user.plan === "PREMIUM") return "Premium";
  return "User";
}