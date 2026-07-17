/**
 * lib/profile-views.ts
 *
 * Single source of truth for recording a profile view. Used from:
 *   - app/[username]/page.tsx (server-render increment, fire-and-forget)
 *   - app/api/profile/view/route.ts (client-callable alternate entry point)
 *
 * Rate limited per IP+profile so a page-refresh loop or a direct API call
 * can't trivially inflate a user's view count. Fire-and-forget by design —
 * this is telemetry, not a user action, so callers should not await this
 * on the critical rendering path and must never surface its errors to the
 * visitor.
 */

import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Generous but not unlimited: enough for a real visitor browsing/refreshing,
// tight enough to blunt a naive spam script hitting the same profile.
const VIEW_WINDOW_MS = 5 * 60 * 1000; // 5 menit
const VIEW_MAX = 20;

export async function recordProfileView(
  userId: string,
  headers: { get(name: string): string | null } | null
): Promise<{ recorded: boolean }> {
  const ip = headers ? getClientIp(headers) : null;
  const key = `profileview:${ip ?? "unknown"}:${userId}`;

  const { allowed } = checkRateLimit(key, {
    windowMs: VIEW_WINDOW_MS,
    max: VIEW_MAX,
  });

  if (!allowed) return { recorded: false };

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  await Promise.allSettled([
    prisma.user.update({
      where: { id: userId },
      data: { profileViews: { increment: 1 } },
    }),
    prisma.profileViewLog.upsert({
      where: { userId_date: { userId, date: today } },
      create: { userId, date: today, views: 1, clicks: 0 },
      update: { views: { increment: 1 } },
    }),
  ]);

  return { recorded: true };
}
