import type { DefaultSession } from "next-auth";
import type { Plan, Role } from "@prisma/client";

// Augmentasi tipe bawaan NextAuth v5 supaya `session.user.id`,
// `session.user.role`, `session.user.plan`, dan `session.user.isFounder`
// dikenali TypeScript di seluruh project — tanpa ini, properti-properti
// itu akan error "Property '...' does not exist".
declare module "next-auth" {
  interface User {
    role: Role;
    plan: Plan;
    isFounder: boolean;
    /** Only set by the Credentials provider's `authorize()`, consumed once by the `jwt` callback. */
    remember?: boolean;
    /** Only set by the Discord provider's `profile()`, consumed once by the `signIn` callback. */
    discordId?: string;
    discordUsername?: string;
    discordGlobalName?: string | null;
    discordBannerUrl?: string | null;
    discordAccentColor?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      plan: Plan;
      isFounder: boolean;
    } & DefaultSession["user"];
    /**
     * Used by lib/dal.ts to check whether this session was revoked (e.g. via
     * "logout all devices"). Deliberately NOT named `jti` — Auth.js's own
     * JWT `encode()` (@auth/core/src/jwt.ts) always overwrites the
     * registered `jti` claim with a fresh `crypto.randomUUID()` via jose's
     * `EncryptJWT.setJti()`, which silently clobbers any custom value
     * stored under that same key. Using a distinct field name avoids the
     * collision entirely.
     */
    sessionJti?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    plan: Plan;
    isFounder: boolean;
    /** See note on `Session.sessionJti` above — same collision applies here. */
    sessionJti?: string;
    /** Whether this session should live for the full 30-day maxAge (remember me)
     *  or the shorter 1-day "not remembered" duration. Sliding-expiry aware. */
    rememberMe?: boolean;
  }
}