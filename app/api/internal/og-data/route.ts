/**
 * app/api/internal/og-data/route.ts
 *
 * Lightweight data source for app/og/route.tsx.
 *
 * Vercel's OG-image bundling (used for any route rendering an
 * `ImageResponse` from "next/og") has its own separate, much smaller
 * bundle-size cap than a normal serverless function (see
 * https://vercel.com/docs/og-image-generation — 500KB bundle limit,
 * and Hobby-plan Edge Function size caps on top of that). Prisma's
 * generated client + query engine alone blows well past that.
 *
 * This route is a *normal* API route: Prisma is only ever imported
 * here, never inside app/og/route.tsx. The OG route fetches this
 * endpoint over HTTP instead of calling Prisma directly, which keeps
 * the two bundles physically separate no matter what either file's
 * dependencies grow to later.
 *
 * Only returns fields that are already public (shown on the profile
 * page itself / rendered into the OG image) — nothing sensitive.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/site-config";

export const runtime = "nodejs";

export type OgDataResponse = {
  siteName: string;
  siteDescription: string;
  user: {
    name: string | null;
    username: string | null;
    bio: string | null;
    image: string | null;
    plan: "FREE" | "PREMIUM";
    role: "ADMIN" | "USER";
    isFounder: boolean;
  } | null;
};

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");
  const config = await getSiteConfig();

  if (!username) {
    const body: OgDataResponse = {
      siteName: config.siteName,
      siteDescription: config.siteDescription,
      user: null,
    };
    return NextResponse.json(body);
  }

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      name: true,
      username: true,
      bio: true,
      image: true,
      plan: true,
      role: true,
      isFounder: true,
    },
  });

  const body: OgDataResponse = {
    siteName: config.siteName,
    siteDescription: config.siteDescription,
    user,
  };
  return NextResponse.json(body);
}
