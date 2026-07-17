"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { updateSiteConfig } from "./actions";

interface SiteConfigInitial {
  siteName: string;
  siteUrl: string;
  siteTitle: string;
  siteDescription: string;
  allowRegistration: boolean;
  maintenanceMode: boolean;
  poweredByVisible: boolean;
  requireTemplateModeration: boolean;
  showAksaIdShowcase: boolean;
  aksaIdDiscordUrl: string | null;
  aksaIdDescription: string | null;
  socialGithub: string | null;
  socialDiscord: string | null;
  socialInstagram: string | null;
  socialYoutube: string | null;
  socialTiktok: string | null;
  socialWebsite: string | null;
}

const inputClass =
  "w-full rounded-xl bg-white/5 border border-border px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-purple/40 outline-none transition-colors";

export function SiteConfigForm({ initial }: { initial: SiteConfigInitial }) {
  const [state, formAction, isPending] = useActionState(updateSiteConfig, { success: false });

  return (
    <form action={formAction} className="space-y-6">
      {/* Identitas Platform */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">Identitas Platform</h3>
        <p className="text-xs text-text-tertiary -mt-2">
          Nama dan branding utama yang ditampilkan di seluruh website. Ini adalah identitas
          platform — bukan AKSA.ID (yang merupakan project terpisah, diatur di bagian Showcase).
        </p>

        <Field label="Nama Platform" name="siteName" defaultValue={initial.siteName} required />
        <Field label="URL Website" name="siteUrl" defaultValue={initial.siteUrl} required />
        <Field label="Site Title (SEO)" name="siteTitle" defaultValue={initial.siteTitle} required />
        <TextAreaField
          label="Deskripsi Website (SEO)"
          name="siteDescription"
          defaultValue={initial.siteDescription}
        />
      </div>

      {/* Toggle settings */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">Pengaturan Umum</h3>

        <ToggleField
          label="Izinkan Registrasi Baru"
          name="allowRegistration"
          defaultChecked={initial.allowRegistration}
        />
        <ToggleField
          label="Mode Maintenance"
          name="maintenanceMode"
          defaultChecked={initial.maintenanceMode}
          danger
        />
        <ToggleField
          label='Tampilkan "Powered by" di profil Free'
          name="poweredByVisible"
          defaultChecked={initial.poweredByVisible}
        />
        <ToggleField
          label="Wajibkan Review Admin sebelum Template Publik Tampil (docs/14 §5)"
          name="requireTemplateModeration"
          defaultChecked={initial.requireTemplateModeration}
        />
      </div>

      {/* AKSA.ID Showcase */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">AKSA.ID Showcase</h3>
        <p className="text-xs text-text-tertiary -mt-2">
          AKSA.ID adalah project terpisah (jasa Discord, aplikasi premium, suntik media
          sosial). Promosikan secara opsional di dalam platform AKSA tanpa menggantikan
          identitas utama website.
        </p>

        <ToggleField
          label="Tampilkan AKSA.ID Showcase di Home Page"
          name="showAksaIdShowcase"
          defaultChecked={initial.showAksaIdShowcase}
        />
        <Field
          label="Link Discord Resmi AKSA.ID"
          name="aksaIdDiscordUrl"
          defaultValue={initial.aksaIdDiscordUrl ?? ""}
          placeholder="https://discord.gg/aksaid"
        />
        <TextAreaField
          label="Deskripsi AKSA.ID"
          name="aksaIdDescription"
          defaultValue={initial.aksaIdDescription ?? ""}
          placeholder="Platform layanan digital yang bergerak di bidang jasa Discord..."
        />
      </div>

      {/* Social links */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">Social Links Platform</h3>
        <p className="text-xs text-text-tertiary -mt-2">
          Link sosial media untuk footer dan sidebar dashboard — milik platform AKSA, bukan AKSA.ID.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="GitHub" name="socialGithub" defaultValue={initial.socialGithub ?? ""} />
          <Field label="Discord" name="socialDiscord" defaultValue={initial.socialDiscord ?? ""} />
          <Field label="Instagram" name="socialInstagram" defaultValue={initial.socialInstagram ?? ""} />
          <Field label="YouTube" name="socialYoutube" defaultValue={initial.socialYoutube ?? ""} />
          <Field label="TikTok" name="socialTiktok" defaultValue={initial.socialTiktok ?? ""} />
          <Field label="Website" name="socialWebsite" defaultValue={initial.socialWebsite ?? ""} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-purple px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-dim transition-colors disabled:opacity-60"
        >
          {isPending ? <Loader2 size={15} className="animate-spin" /> : null}
          Simpan Konfigurasi
        </button>
        {state?.success && (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
            <CheckCircle2 size={14} />
            Tersimpan
          </span>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs text-text-tertiary mb-1.5">
        {label}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
}

function TextAreaField({
  label,
  name,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs text-text-tertiary mb-1.5">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        defaultValue={defaultValue}
        rows={3}
        placeholder={placeholder}
        className={`${inputClass} resize-none`}
      />
    </div>
  );
}

function ToggleField({
  label,
  name,
  defaultChecked,
  danger,
}: {
  label: string;
  name: string;
  defaultChecked: boolean;
  danger?: boolean;
}) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer">
      <span className={`text-sm ${danger ? "text-red-300" : "text-text-secondary"}`}>{label}</span>
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span
        className={`relative inline-block h-6 w-11 rounded-full bg-white/10 transition-colors peer-checked:bg-purple after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5`}
      />
    </label>
  );
}
