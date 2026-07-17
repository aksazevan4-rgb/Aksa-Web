import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { Plan, Role, AuditAction } from "@prisma/client";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { twoFactorService } from "@/features/two-factor/server/service";
import { verifyTrustedDeviceToken } from "@/lib/trusted-device";
import { extractCookieValue, TRUSTED_DEVICE_COOKIE_NAME } from "@/lib/trusted-device-token";

const REMEMBER_ME_MAX_AGE = 30 * 24 * 60 * 60; // 30 hari
const NOT_REMEMBERED_MAX_AGE = 24 * 60 * 60; // 1 hari

/** Discord's default-avatar index depends on which numbering system the account uses. */
function discordDefaultAvatarUrl(id: string, discriminator: string): string {
  const index =
    discriminator === "0"
      ? Number((BigInt(id) >> 22n) % 6n)
      : Number(discriminator) % 5;
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

interface DiscordRawProfile {
  id: string;
  username: string;
  discriminator: string;
  global_name: string | null;
  avatar: string | null;
  banner: string | null;
  accent_color: number | null;
  email: string | null;
  verified: boolean;
}

async function getRequestMeta() {
  try {
    const h = await headers();

    const forwarded = h.get("x-forwarded-for");

    const ipAddress = forwarded
      ? forwarded.split(",")[0].trim()
      : h.get("x-real-ip");

    const userAgent = h.get("user-agent");

    return {
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
    };
  } catch {
    return {
      ipAddress: null,
      userAgent: null,
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
    maxAge: REMEMBER_ME_MAX_AGE,
    updateAge: 24 * 60 * 60,
  },

  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  pages: {
    signIn: "/login",
  },

  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      // Required so a user who registered with email/password (or the other
      // OAuth provider) using the same address can also sign in with GitHub
      // instead of ending up with a second, duplicate account. Our own
      // `signIn` callback below re-verifies the email before trusting it.
      allowDangerousEmailAccountLinking: true,
    }),

    Discord({
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
      authorization: { params: { scope: "identify email" } },
      allowDangerousEmailAccountLinking: true,
      profile(profile: DiscordRawProfile) {
        const avatarUrl = profile.avatar
          ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${profile.avatar.startsWith("a_") ? "gif" : "png"}`
          : discordDefaultAvatarUrl(profile.id, profile.discriminator);

        const bannerUrl = profile.banner
          ? `https://cdn.discordapp.com/banners/${profile.id}/${profile.banner}.${profile.banner.startsWith("a_") ? "gif" : "png"}`
          : null;

        return {
          id: profile.id,
          name: profile.global_name ?? profile.username,
          email: profile.email,
          image: avatarUrl,
          role: Role.USER,
          plan: Plan.FREE,
          isFounder: false,
          // Custom fields — these all map to real columns on User, so the
          // Prisma adapter can safely persist them as-is on user creation.
          discordId: profile.id,
          discordUsername: profile.username,
          discordGlobalName: profile.global_name,
          discordBannerUrl: bannerUrl,
          discordAccentColor:
            profile.accent_color != null
              ? `#${profile.accent_color.toString(16).padStart(6, "0")}`
              : null,
          // NOTE: deliberately NOT including `discordVerifiedEmail` here.
          // The Prisma adapter spreads this entire object straight into
          // `prisma.user.create()` — any field without a matching column
          // (this one has none, on purpose, since we never want to persist
          // it) makes that insert throw "Unknown argument". Email
          // verification is checked in the `signIn` callback instead, using
          // the raw OAuth `profile` argument Auth.js passes there.
        };
      },
    }),

    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),

    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
        remember: {
          label: "Remember me",
          type: "text",
        },
        // Fase Auth hardening — docs/05-auth-system.md §2 (2FA)
        totpCode: {
          label: "Kode 2FA",
          type: "text",
        },
        recoveryCode: {
          label: "Recovery code",
          type: "text",
        },
      },

      async authorize(credentials, request) {
        const email = credentials?.email
          ?.toString()
          .trim()
          .toLowerCase();

        const password = credentials?.password?.toString();
        const remember = credentials?.remember?.toString() === "true";

        if (!email || !password) {
          return null;
        }

        const { allowed, retryAfterMs } =
          checkRateLimit(`login:${email}`);

        if (!allowed) {
          const minutes = Math.ceil(retryAfterMs / 60000);

          throw new Error(
            `Terlalu banyak percobaan login. Coba lagi dalam ${minutes} menit.`
          );
        }

        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          password,
          user.password
        );

        if (!isValid) {
          return null;
        }

        // Fase Auth hardening (docs/05 §2): "login flow dengan 2FA aktif —
        // credentials valid → redirect ke step verifikasi TOTP SEBELUM
        // session dibuat penuh". Di sini disederhanakan jadi satu langkah:
        // kalau 2FA aktif, totpCode/recoveryCode harus ikut dikirim di
        // request yang SAMA (bukan redirect terpisah) — trade-off sengaja
        // supaya tidak perlu merombak NextAuth authorize() jadi multi-step,
        // tapi tetap tidak pernah membuat session penuh tanpa kode 2FA yang
        // valid saat 2FA aktif.
        if (user.twoFactorEnabled) {
          // docs/05 §3 — Trusted Device: kalau device ini sudah dipercaya
          // (cookie valid & belum expired & memang milik user ini),
          // lewati kewajiban kode 2FA. Verifikasi dilakukan penuh di sini
          // (bukan percaya klaim dari client) — lihat catatan keamanan di
          // lib/trusted-device.ts. Kegagalan APA PUN (cookie tidak ada,
          // tidak valid, dll) jatuh ke jalur normal di bawah yang tetap
          // mewajibkan kode.
          const cookieHeader = request?.headers?.get("cookie") ?? null;
          const trustedToken = extractCookieValue(cookieHeader, TRUSTED_DEVICE_COOKIE_NAME);
          const isTrustedDevice = await verifyTrustedDeviceToken(user.id, trustedToken);

          if (!isTrustedDevice) {
            const totpCode = credentials?.totpCode?.toString().trim();
            const recoveryCode = credentials?.recoveryCode?.toString().trim();

            if (!totpCode && !recoveryCode) {
              throw new Error("2FA_REQUIRED");
            }

            const valid = await twoFactorService.verifyLoginChallenge(user.id, {
              totpCode: totpCode || undefined,
              recoveryCode: recoveryCode || undefined,
            });

            if (!valid) {
              throw new Error("2FA_INVALID");
            }
          }
        }

        resetRateLimit(`login:${email}`);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          plan: user.plan,
          isFounder: user.isFounder,
          remember,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) {
        console.error(
          "[AUTH_SIGNIN_DENIED] no email on profile",
          { provider: account?.provider }
        );
        return false;
      }

      // Safety check for account linking: Discord's OAuth profile tells us
      // whether the email on that Discord account is verified. Since we
      // enable `allowDangerousEmailAccountLinking` (so one person can use
      // Email + GitHub + Discord on a single account), we must not trust
      // an unverified email — otherwise someone could register a Discord
      // account with *your* email and get signed into *your* account here.
      //
      // We read this from the raw OAuth `profile` param (untouched Discord
      // API response), NOT from a custom field on `user` — anything added
      // to the object returned by the provider's `profile()` gets persisted
      // as-is by the Prisma adapter, so it must never carry fields with no
      // matching database column.
      if (account?.provider === "discord") {
        const discordProfile = profile as unknown as DiscordRawProfile | undefined;

        if (discordProfile?.verified !== true) {
          console.error(
            "[AUTH_SIGNIN_DENIED] discord email not verified",
            { email: user.email, verified: discordProfile?.verified }
          );
          return false;
        }
      }

      // NOTE: we intentionally do NOT look up/require an existing DB user
      // here. For OAuth providers, Auth.js only creates the User row via
      // the Prisma adapter *after* this callback returns `true` — so on a
      // brand-new Discord/GitHub sign-in there is nothing to find yet, and
      // rejecting on "not found" would block every first-time OAuth login.
      // All DB bookkeeping (lastLogin, Discord sync, admin bootstrap, etc.)
      // happens in the `jwt` callback below instead, which always runs
      // after the adapter has created/linked the user.
      return true;
    },

  async jwt({ token, user, account }) {
  // Login pertama
  if (account && user) {
    const { ipAddress, userAgent } =
      await getRequestMeta();

    const method = account.provider ?? "credentials";

    // By the time this callback runs, the Prisma adapter has already
    // created (brand-new OAuth signup) or found (returning user) the User
    // row — unlike in `signIn` above, it is safe to assume it exists here.
    let dbUser = await prisma.user.findUnique({
      where: {
        email: user.email!,
      },
    });

    if (!dbUser) {
      // Should not happen (adapter always persists the user before this
      // callback runs), but guard anyway instead of crashing on `dbUser!.id`.
      console.error("[AUTH_JWT_USER_MISSING]", user.email);
      return token;
    }

    try {
      const bootstrapEmail =
        process.env.ADMIN_BOOTSTRAP_EMAIL?.toLowerCase();

      const isBootstrapAdmin =
        bootstrapEmail && user.email!.toLowerCase() === bootstrapEmail;

      dbUser = await prisma.user.update({
        where: {
          id: dbUser.id,
        },
        data: {
          ...(isBootstrapAdmin
            ? {
                role: Role.ADMIN,
                isFounder: true,
              }
            : {}),
          lastLoginAt: new Date(),
          lastSeenAt: new Date(),
          lastLoginIp: ipAddress,
        },
      });

      await prisma.loginEvent.create({
        data: {
          userId: dbUser.id,
          success: true,
          method,
          ipAddress,
          userAgent,
        },
      });

      // Keep the profile in sync with whichever OAuth provider was just
      // used to sign in — avatar/name/Discord metadata always reflect
      // the most recently used provider, per spec.
      if (account.provider === "discord" && "discordId" in user && user.discordId) {
        const isFirstLink = !dbUser.discordLinked;

        try {
          dbUser = await prisma.user.update({
            where: { id: dbUser.id },
            data: {
              discordId: user.discordId,
              discordLinked: true,
              discordUsername: user.discordUsername ?? null,
              discordGlobalName: user.discordGlobalName ?? null,
              discordBannerUrl: user.discordBannerUrl ?? null,
              discordAccentColor: user.discordAccentColor ?? null,
              image: user.image ?? dbUser.image,
              name: user.name ?? dbUser.name,
            },
          });

          if (isFirstLink) {
            await prisma.auditLog.create({
              data: {
                actorId: dbUser.id,
                action: AuditAction.DISCORD_LINK,
                entityType: "User",
                entityId: dbUser.id,
                metadata: { discordUsername: user.discordUsername ?? null },
              },
            });
          }
        } catch (syncError) {
          // Another user already has this Discord ID linked (e.g. they
          // previously typed it manually into the profile form). Don't
          // block the actual login over a cosmetic sync failure.
          console.error("[DISCORD_SYNC_ERROR]", syncError);
        }
      } else if (account.provider === "github" && user.image) {
        dbUser = await prisma.user
          .update({
            where: { id: dbUser.id },
            data: {
              image: user.image,
              name: user.name ?? dbUser.name,
            },
          })
          .catch((error: unknown) => {
            console.error("[GITHUB_SYNC_ERROR]", error);
            return dbUser!;
          });
      }
    } catch (error) {
      console.error(
        "[AUTH_JWT_UPDATE_ERROR]",
        error
      );
    }

    token.id = dbUser.id;
    token.role = dbUser.role;
    token.plan = dbUser.plan;
    token.isFounder = dbUser.isFounder;
    token.rememberMe = user.remember ?? true;

    const jti = randomUUID();

    const maxAge =
      token.rememberMe === false
        ? NOT_REMEMBERED_MAX_AGE
        : REMEMBER_ME_MAX_AGE;

    console.log("[AUTH_JWT] creating ActiveToken", {
      jti,
      userId: dbUser.id,
    });

    try {
      const createdToken = await prisma.activeToken.create({
        data: {
          jti,
          userId: dbUser.id,
          ipAddress,
          userAgent,
          expiresAt: new Date(
            Date.now() + maxAge * 1000
          ),
        },
      });

      console.log("[AUTH_JWT] ActiveToken created OK", {
        id: createdToken.id,
        jti: createdToken.jti,
      });

      // PENTING: field ini SENGAJA tidak dinamai `token.jti`.
      // Auth.js (@auth/core/src/jwt.ts -> encode()) selalu memanggil
      // `.setJti(crypto.randomUUID())` dari library `jose` saat menulis
      // cookie, dan itu MENIMPA apa pun yang ada di key `jti` pada payload
      // token — termasuk custom id kita — dengan UUID acak baru miliknya
      // sendiri. Akibatnya jti yang dipakai untuk membuat ActiveToken
      // TIDAK PERNAH sama dengan jti yang benar-benar berakhir di cookie.
      // Dengan menyimpan di key lain (`sessionJti`), Auth.js tidak akan
      // pernah menyentuh/menimpanya, karena `setJti()` hanya menulis ke
      // key `jti`.
      //
      // Kita juga baru men-set `token.sessionJti` di sini, SETELAH baris
      // `prisma.activeToken.create()` di atas selesai sukses — bukan
      // sebelumnya. Kalau create() gagal (mis. DB Neon sedang unreachable),
      // `token.sessionJti` akan tetap `undefined`, dan `lib/dal.ts` sudah
      // punya jalur khusus untuk itu (`if (!session.sessionJti)` ->
      // redirect ke /login) — jadi kegagalan DB tidak lagi menghasilkan
      // cookie "kelihatan valid" yang sebenarnya menunjuk ke ActiveToken
      // yang tidak ada.
      token.sessionJti = jti;

      token.exp =
        Math.floor(Date.now() / 1000) +
        maxAge;
    } catch (activeTokenError) {
      console.error(
        "[AUTH_JWT_ACTIVETOKEN_ERROR] failed to create ActiveToken",
        activeTokenError
      );
    }
  }

  return token;
},

    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id);

        session.user.role =
          (token.role as Role) ??
          Role.USER;

        session.user.plan =
          (token.plan as Plan) ??
          Plan.FREE;

        session.user.isFounder =
          Boolean(token.isFounder);
      }

      session.sessionJti = token.sessionJti as string | undefined;

      return session;
    },
  },
});