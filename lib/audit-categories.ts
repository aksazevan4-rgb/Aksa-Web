import type { AuditAction } from "@prisma/client";

export type LogCategory = "activity" | "security" | "content" | "system" | "audit" | "developer";

export const LOG_CATEGORIES: { key: LogCategory; label: string; colorClass: string }[] = [
  { key: "activity", label: "Activity", colorClass: "text-blue bg-blue/10 border-blue/20" },
  { key: "security", label: "Security", colorClass: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  { key: "content", label: "Content", colorClass: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  { key: "system", label: "System", colorClass: "text-text-secondary bg-white/5 border-border" },
  { key: "audit", label: "Audit", colorClass: "text-purple bg-purple/10 border-purple/20" },
  { key: "developer", label: "Developer", colorClass: "text-pink-400 bg-pink-400/10 border-pink-400/20" },
];

/** Every AuditAction enum value mapped to exactly one category — no
 * action appears twice, so nothing gets double-counted across tabs. */
export const ACTION_CATEGORY: Record<AuditAction, LogCategory> = {
  // Activity — things a user did to their own account/profile
  USER_REGISTER: "activity",
  USER_UPDATE: "activity",
  PROFILE_UPDATE: "activity",
  LINK_CREATE: "activity",
  LINK_UPDATE: "activity",
  LINK_DELETE: "activity",
  MEDIA_UPLOAD: "activity",
  MEDIA_DELETE: "activity",

  // Security — auth, sessions, account access
  USER_LOGIN: "security",
  USER_LOGOUT: "security",
  USER_BAN: "security",
  USER_UNBAN: "security",
  USER_STATUS_CHANGE: "security",
  PASSWORD_RESET_REQUEST: "security",
  PASSWORD_RESET_COMPLETE: "security",
  EMAIL_VERIFY_REQUEST: "security",
  EMAIL_VERIFIED: "security",
  EMAIL_CHANGE_REQUEST: "security",
  EMAIL_CHANGE_COMPLETE: "security",
  DISCORD_LINK: "security",
  DISCORD_UNLINK: "security",
  API_KEY_CREATE: "security",
  API_KEY_REVOKE: "security",
  TWO_FACTOR_ENABLE: "security",
  TWO_FACTOR_DISABLE: "security",
  TRUSTED_DEVICE_ADD: "security",
  TRUSTED_DEVICE_REVOKE: "security",

  // Content — site/content-editor changes (admin content dashboard)
  CONTENT_UPDATE: "content",

  // System — site-wide configuration
  SETTINGS_UPDATE: "system",
  FEATURE_FLAG_UPDATE: "system",

  // Audit — admin oversight over OTHER users' accounts/plans
  USER_DELETE: "audit",
  USER_PLAN_CHANGE: "audit",
  USER_ROLE_CHANGE: "audit",
  ADMIN_ACTION: "audit",
  BADGE_GRANT: "audit",
  BADGE_REVOKE: "audit",
  CREDIT_GRANT: "audit",
};

export function getLogCategory(action: AuditAction): LogCategory {
  return ACTION_CATEGORY[action] ?? "system";
}
