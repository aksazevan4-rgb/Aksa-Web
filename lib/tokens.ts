/**
 * lib/tokens.ts
 *
 * Shared helpers for single-use, expiring tokens (email verification,
 * password reset, email change) — all backed by the existing Auth.js
 * `VerificationToken` table (identifier + token + expires), so no new
 * database table/migration is needed.
 *
 * `identifier` is namespaced per purpose (e.g. `password-reset:<email>`)
 * so the same table can safely serve multiple unrelated flows.
 */

import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

export const TOKEN_PURPOSE = {
  EMAIL_VERIFY: "email-verify",
  PASSWORD_RESET: "password-reset",
  EMAIL_CHANGE: "email-change",
} as const;

export type TokenPurpose = (typeof TOKEN_PURPOSE)[keyof typeof TOKEN_PURPOSE];

function buildIdentifier(purpose: TokenPurpose, key: string) {
  return `${purpose}:${key}`;
}

/**
 * Create a new single-use token. Any previous unused tokens for the same
 * identifier are deleted first, so only one valid link is ever active.
 */
export async function createToken(
  purpose: TokenPurpose,
  key: string,
  expiresInMs: number
): Promise<string> {
  const identifier = buildIdentifier(purpose, key);
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + expiresInMs);

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  return token;
}

/**
 * Validate and consume (delete) a token. Returns the `key` it was issued
 * for (e.g. the email address) if valid, or null if invalid/expired.
 */
export async function consumeToken(
  purpose: TokenPurpose,
  key: string,
  token: string
): Promise<boolean> {
  const identifier = buildIdentifier(purpose, key);

  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier, token } },
  });

  if (!record || record.expires < new Date()) {
    if (record) {
      // Expired — clean it up so it can't be retried.
      await prisma.verificationToken
        .delete({ where: { identifier_token: { identifier, token } } })
        .catch(() => {});
    }
    return false;
  }

  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier, token } },
  });

  return true;
}
