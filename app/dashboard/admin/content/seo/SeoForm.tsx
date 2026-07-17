"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { MediaUploadField } from "@/components/admin/MediaUploadField";
import { updateSettings } from "./actions";

interface SeoFormProps {
  initial: {
    siteTitle: string;
    siteDescription: string;
    ogImageUrl: string | null;
    socialGithub: string | null;
    socialDiscord: string | null;
    socialWebsite: string | null;
    socialSaweria: string | null;
    socialYoutube: string | null;
    socialTiktok: string | null;
    socialInstagram: string | null;
    socialBagibagi: string | null;
    aksaIdDiscordUrl: string | null;
  };
}

const inputClass =
  "w-full rounded-xl bg-white/5 border border-border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-purple/40 outline-none transition-colors";

const SOCIAL_FIELDS: { name: keyof SeoFormProps["initial"]; label: string }[] = [
  { name: "socialGithub", label: "GitHub" },
  { name: "socialDiscord", label: "Discord (personal)" },
  { name: "aksaIdDiscordUrl", label: "Discord AKSA.ID (komunitas)" },
  { name: "socialWebsite", label: "Website" },
  { name: "socialYoutube", label: "YouTube" },
  { name: "socialTiktok", label: "TikTok" },
  { name: "socialInstagram", label: "Instagram" },
  { name: "socialSaweria", label: "Saweria" },
  { name: "socialBagibagi", label: "BagiBagi" },
];

export function SeoForm({ initial }: SeoFormProps) {
  const [state, formAction, isPending] = useActionState(updateSettings, {});

  return (
    <form action={formAction} className="space-y-6">
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">
          SEO &amp; Metadata
        </h3>

        <div>
          <label className="block text-xs text-text-tertiary mb-1.5">
            Site Title
          </label>
          <input
            name="siteTitle"
            defaultValue={initial.siteTitle}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs text-text-tertiary mb-1.5">
            Site Description
          </label>
          <textarea
            name="siteDescription"
            defaultValue={initial.siteDescription}
            required
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        <MediaUploadField
          name="ogImage"
          label="OG Image (preview saat link dibagikan)"
          folder="og-images"
          defaultValue={initial.ogImageUrl}
          aspectClassName="aspect-[1.91/1]"
        />
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">
          Link Sosial Media
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {SOCIAL_FIELDS.map((field) => (
            <div key={field.name}>
              <label className="block text-xs text-text-tertiary mb-1.5">
                {field.label}
              </label>
              <input
                name={field.name}
                type="url"
                defaultValue={initial[field.name] ?? ""}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </div>

      {state.error && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-xl px-4 py-3 flex items-center gap-2">
          <CheckCircle2 size={16} />
          Pengaturan berhasil disimpan.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-xl bg-purple px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isPending && <Loader2 size={15} className="animate-spin" />}
        Simpan Perubahan
      </button>
    </form>
  );
}
