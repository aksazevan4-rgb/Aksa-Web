"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Crown,
  ExternalLink,
  Link2,
  Loader2,
  MessageSquare,
  UserRound,
  ImageIcon,
  Globe2,
  Share2,
} from "lucide-react";
import { updateProfile } from "@/app/dashboard/profile/actions";
import { SOCIAL_PLATFORMS, SOCIAL_CATEGORIES } from "@/app/dashboard/profile/data";
import { UserAvatar } from "@/components/UserAvatar";
import { UserMediaUploadField } from "@/components/UserMediaUploadField";
import { PROFILE_THEMES } from "@/lib/profile-themes";

interface ProfileFormProps {
  initial: {
    name: string;
    username: string | null;
    bio: string | null;
    image: string | null;
    bannerImage: string | null;
    socialLinks: Record<string, string> | null;
    profileVisibility: "PUBLIC" | "PRIVATE";
    profileTheme: string | null;
    profileAccentColor: string | null;
    discordId: string | null;
    discordLinked: boolean;
    discordOAuthLinked: boolean;
    discordUsername: string | null;
    discordGlobalName: string | null;
  };
  stats: {
    profileViews: number;
    totalClicks: number;
    linkCount: number;
  };
  /** Public profile host, derived from SiteConfig — never hardcoded. */
  profileHost: string;
  accessibleFeatures: string[];
}

const inputClass =
  "w-full rounded-xl bg-white/5 border border-border px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-purple/40 outline-none transition-colors";

export function ProfileForm({ initial, stats, profileHost, accessibleFeatures }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfile, {});
  const hasCustomAccent = accessibleFeatures.includes("custom_accent_color");
  const [accentColor, setAccentColor] = useState(initial.profileAccentColor ?? "");
  const [bio, setBio] = useState(initial.bio ?? "");

  return (
    <form action={formAction} className="space-y-6">
      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <UserRound size={16} className="text-purple" />
          <h3 className="text-sm font-semibold text-text-primary">
            Informasi Dasar
          </h3>
        </div>

        <div>
          <label htmlFor="name" className="block text-xs text-text-tertiary mb-1.5">
            Display Name
          </label>
          <input
            id="name"
            name="name"
            defaultValue={initial.name}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="username" className="block text-xs text-text-tertiary mb-1.5">
            Username
          </label>
          <input
            id="username"
            name="username"
            defaultValue={initial.username ?? ""}
            placeholder="cth: johndoe"
            className={inputClass}
          />
          <p className="text-[11px] text-text-tertiary mt-1">
            3-24 karakter, hanya huruf, angka, dan underscore. Username ini
            jadi alamat profil publikmu: {profileHost}/username.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="bio" className="block text-xs text-text-tertiary">
              Bio
            </label>
            <span className="text-[11px] text-text-tertiary tabular-nums">{bio.length}/280</span>
          </div>
          <textarea
            id="bio"
            name="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={280}
            placeholder="Ceritakan sedikit tentang dirimu... (opsional)"
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ImageIcon size={16} className="text-purple" />
          <h3 className="text-sm font-semibold text-text-primary">
            Foto Profil &amp; Banner
          </h3>
        </div>
        <p className="text-[11px] text-text-tertiary -mt-2">
          Cara lebih cepat: upload lewat{" "}
          <Link href="/dashboard/profile/appearance" className="text-purple hover:underline">
            Tampilan → Media Profil
          </Link>{" "}
          — langsung tersimpan tanpa perlu klik &quot;Simpan Profil&quot; di bawah.
        </p>

        <div className="flex items-center gap-4">
          <UserAvatar
            src={initial.image}
            name={initial.name}
            sizeClassName="h-14 w-14"
            textClassName="text-xl"
            className="border border-purple/20"
          />
          <div className="flex-1">
            <UserMediaUploadField
              name="image"
              label="Foto Profil"
              folder="avatars"
              defaultValue={initial.image}
              aspectClassName="aspect-square max-w-[160px]"
            />
          </div>
        </div>

        <UserMediaUploadField
          name="bannerImage"
          label="Banner"
          folder="banners"
          defaultValue={initial.bannerImage}
          aspectClassName="aspect-[3/1]"
        />
      </div>

      {/* Discord linking */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-[#5865f2]" />
          <h3 className="text-sm font-semibold text-text-primary">
            Integrasi Discord
          </h3>
        </div>
        <p className="text-xs text-text-tertiary -mt-1">
          Hubungkan Discord ID-mu untuk menampilkan status online, aktivitas, dan
          Spotify secara real-time di profilmu.
        </p>

        {initial.discordOAuthLinked ? (
          <div>
            <label className="block text-xs text-text-tertiary mb-1.5">
              Discord User ID
            </label>
            <input
              value={initial.discordId ?? ""}
              disabled
              className={`${inputClass} opacity-60 cursor-not-allowed`}
            />
            <input type="hidden" name="discordId" value={initial.discordId ?? ""} />
            <p className="text-[11px] text-text-tertiary mt-1">
              Terhubung otomatis lewat Discord OAuth
              {initial.discordGlobalName || initial.discordUsername
                ? ` sebagai @${initial.discordGlobalName ?? initial.discordUsername}`
                : ""}
              . Untuk mengganti akun Discord yang terhubung, hubungkan ulang
              lewat halaman login.
            </p>
          </div>
        ) : (
          <div>
            <label htmlFor="discordId" className="block text-xs text-text-tertiary mb-1.5">
              Discord User ID
            </label>
            <input
              id="discordId"
              name="discordId"
              defaultValue={initial.discordId ?? ""}
              placeholder="cth: 123456789012345678"
              pattern="\d{17,20}"
              className={inputClass}
            />
            <p className="text-[11px] text-text-tertiary mt-1">
              Aktifkan Developer Mode di Discord, klik kanan profilmu, lalu pilih
              &quot;Copy User ID&quot;. Kamu juga perlu bergabung ke server Lanyard di{" "}
              <a
                href="https://discord.gg/lanyard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple hover:underline"
              >
                discord.gg/lanyard
              </a>{" "}
              agar status real-time bisa terbaca. Atau, hubungkan langsung dan
              otomatis lewat tombol &quot;Lanjutkan dengan Discord&quot; di
              halaman login.
            </p>
          </div>
        )}

        {initial.discordLinked && (
          <p className="text-xs text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 size={13} />
            Discord terhubung
          </p>
        )}
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Globe2 size={16} className="text-purple" />
            <h3 className="text-sm font-semibold text-text-primary">
              Profil Publik
            </h3>
          </div>
          {initial.username && (
            <Link
              href={`/${initial.username}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs text-purple hover:underline"
            >
              Lihat profil publik
              <ExternalLink size={12} />
            </Link>
          )}
        </div>

        {!initial.username && (
          <p className="text-xs text-amber-300 bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-3">
            Isi username di atas dulu supaya profil publikmu aktif di{" "}
            {profileHost}/username.
          </p>
        )}

        <div className="grid sm:grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-white/5 border border-border py-3">
            <p className="text-lg font-semibold text-text-primary">
              {stats.profileViews.toLocaleString("id-ID")}
            </p>
            <p className="text-[11px] text-text-tertiary mt-0.5">Profile Views</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-border py-3">
            <p className="text-lg font-semibold text-text-primary">
              {stats.totalClicks.toLocaleString("id-ID")}
            </p>
            <p className="text-[11px] text-text-tertiary mt-0.5">Link Clicks</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-border py-3">
            <p className="text-lg font-semibold text-text-primary">
              {stats.linkCount}
            </p>
            <p className="text-[11px] text-text-tertiary mt-0.5">Total Link</p>
          </div>
        </div>

        <Link
          href="/dashboard/profile/links"
          className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-border px-4 py-2.5 text-sm text-text-secondary hover:border-purple/40 hover:text-text-primary transition-colors"
        >
          <Link2 size={15} />
          Kelola Link Manager
        </Link>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs text-text-tertiary mb-1.5">
              Visibilitas
            </label>
            <select
              name="profileVisibility"
              defaultValue={initial.profileVisibility}
              className={inputClass}
            >
              <option value="PUBLIC">Public — siapa saja bisa lihat</option>
              <option value="PRIVATE">Private — hanya kamu &amp; admin</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-text-tertiary mb-1.5">
              Tema Profil Publik
            </label>
            <select
              name="profileTheme"
              defaultValue={initial.profileTheme ?? "default"}
              className={inputClass}
            >
              {PROFILE_THEMES.map((theme) => (
                <option key={theme.key} value={theme.key}>
                  {theme.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="profileAccentColor" className="flex items-center gap-1.5 text-xs text-text-tertiary mb-1.5">
              Warna Aksen Custom
              {!hasCustomAccent && <Crown size={11} className="text-amber-300" />}
            </label>
            {hasCustomAccent ? (
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="profileAccentColor"
                  name="profileAccentColor"
                  value={accentColor || "#9b6dff"}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-11 w-11 rounded-xl border border-border bg-transparent cursor-pointer flex-shrink-0"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  placeholder="Kosongkan untuk pakai warna bawaan tema"
                  className={`${inputClass} flex-1`}
                />
                {accentColor && (
                  <button
                    type="button"
                    onClick={() => setAccentColor("")}
                    className="text-xs text-text-tertiary hover:text-text-primary flex-shrink-0"
                  >
                    Reset
                  </button>
                )}
              </div>
            ) : (
              <>
                <input type="hidden" name="profileAccentColor" value="" />
                <div className={`${inputClass} flex items-center justify-between text-text-tertiary cursor-not-allowed`}>
                  Upgrade ke Premium untuk warna custom
                </div>
              </>
            )}
          </div>
        </div>

        <p className="text-[11px] text-text-tertiary">
          Ingin atur layout, background, dan widget lebih lanjut? Buka{" "}
          <Link href="/dashboard/profile/appearance" className="text-purple hover:underline">
            halaman Tampilan
          </Link>
          .
        </p>
      </div>

      <div className="glass rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Share2 size={16} className="text-purple" />
          <h3 className="text-sm font-semibold text-text-primary">
            Link Sosial Media
          </h3>
        </div>
        <p className="text-[11px] text-text-tertiary -mt-3">
          Semua kolom di bawah opsional — kosongkan yang tidak dipakai.
        </p>

        {SOCIAL_CATEGORIES.map((category) => {
          const platforms = SOCIAL_PLATFORMS.filter((p) => p.category === category.id);
          if (platforms.length === 0) return null;
          return (
            <div key={category.id}>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-text-tertiary mb-2.5">
                {category.label}
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {platforms.map((platform) => (
                  <div key={platform.id}>
                    <label
                      htmlFor={`social_${platform.id}`}
                      className="block text-xs text-text-tertiary mb-1.5"
                    >
                      {platform.label}
                    </label>
                    <input
                      id={`social_${platform.id}`}
                      name={`social_${platform.id}`}
                      type="text"
                      defaultValue={initial.socialLinks?.[platform.id] ?? ""}
                      placeholder={platform.placeholder}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {state.error && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
          {state.error}
        </p>
      )}

      {state.success && (
        <p className="text-sm text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-xl px-4 py-3 flex items-center gap-2">
          <CheckCircle2 size={16} />
          Profil berhasil disimpan.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-xl bg-purple px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-dim transition-colors disabled:opacity-60"
      >
        {isPending ? <Loader2 size={15} className="animate-spin" /> : null}
        Simpan Profil
      </button>
    </form>
  );
}
