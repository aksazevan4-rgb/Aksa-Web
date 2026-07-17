"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { MediaUploadField } from "@/components/admin/MediaUploadField";
import { updateAboutProfile } from "./actions";

interface AboutFormProps {
  initial: {
    name: string;
    role: string;
    roles: string[];
    founderOf: string | null;
    location: string;
    timezone: string;
    status: string;
    bioParagraphs: string[];
    avatarUrl: string | null;
  };
}

const inputClass =
  "w-full rounded-xl bg-white/5 border border-border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-purple/40 outline-none transition-colors";

export function AboutForm({ initial }: AboutFormProps) {
  const [state, formAction, isPending] = useActionState(updateAboutProfile, {});

  return (
    <form action={formAction} className="space-y-6">
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">Identitas</h3>

        <MediaUploadField
          name="avatar"
          label="Avatar"
          folder="profile-avatar"
          defaultValue={initial.avatarUrl}
          aspectClassName="aspect-square max-w-[140px]"
        />

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-text-tertiary mb-1.5">
              Nama
            </label>
            <input
              name="name"
              defaultValue={initial.name}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-text-tertiary mb-1.5">
              Founder Of (opsional)
            </label>
            <input
              name="founderOf"
              defaultValue={initial.founderOf ?? ""}
              placeholder="AKSA.ID"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-text-tertiary mb-1.5">
            Role Utama
          </label>
          <input
            name="role"
            defaultValue={initial.role}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs text-text-tertiary mb-1.5">
            Daftar Role (untuk animasi berganti di Hero, pisahkan dengan koma)
          </label>
          <input
            name="roles"
            defaultValue={initial.roles.join(", ")}
            placeholder="Discord Bot Developer, Fullstack Developer, System Architect"
            className={inputClass}
          />
        </div>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">Status</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-text-tertiary mb-1.5">
              Lokasi
            </label>
            <input
              name="location"
              defaultValue={initial.location}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-text-tertiary mb-1.5">
              Timezone
            </label>
            <input
              name="timezone"
              defaultValue={initial.timezone}
              required
              placeholder="UTC+7"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-text-tertiary mb-1.5">
              Status
            </label>
            <input
              name="status"
              defaultValue={initial.status}
              required
              placeholder="Sedang membangun"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">
          Bio (satu paragraf per baris)
        </h3>
        <textarea
          name="bioParagraphs"
          defaultValue={initial.bioParagraphs.join("\n")}
          required
          rows={6}
          className={`${inputClass} resize-none`}
        />
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
        className="inline-flex items-center gap-2 rounded-xl bg-purple px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isPending && <Loader2 size={15} className="animate-spin" />}
        Simpan Perubahan
      </button>
    </form>
  );
}
