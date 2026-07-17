"use client";

import { useActionState, useEffect } from "react";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { MediaUploadField } from "@/components/admin/MediaUploadField";
import { upsertTestimonial } from "./actions";

export interface TestimonialFormData {
  id?: string;
  name: string;
  role: string | null;
  content: string;
  avatarUrl: string | null;
  order: number;
}

const inputClass =
  "w-full rounded-xl bg-white/5 border border-border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-purple/40 outline-none transition-colors";

export function TestimonialForm({
  initial,
  onClose,
}: {
  initial: TestimonialFormData | null;
  onClose: () => void;
}) {
  const [state, formAction, isPending] = useActionState(upsertTestimonial, {});

  useEffect(() => {
    if (state.success) {
      const t = setTimeout(onClose, 600);
      return () => clearTimeout(t);
    }
  }, [state.success, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 my-8 space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full text-text-tertiary hover:text-text-primary hover:bg-white/5"
        >
          <X size={16} />
        </button>

        <h2 className="font-display font-semibold text-lg text-text-primary">
          {initial?.id ? "Edit Testimoni" : "Tambah Testimoni"}
        </h2>

        <form action={formAction} className="space-y-4">
          {initial?.id && <input type="hidden" name="id" value={initial.id} />}

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-tertiary mb-1.5">
                Nama
              </label>
              <input
                name="name"
                defaultValue={initial?.name ?? ""}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-text-tertiary mb-1.5">
                Peran (opsional)
              </label>
              <input
                name="role"
                defaultValue={initial?.role ?? ""}
                placeholder="Owner Server Discord"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-text-tertiary mb-1.5">
              Isi Testimoni
            </label>
            <textarea
              name="content"
              defaultValue={initial?.content ?? ""}
              required
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </div>

          <MediaUploadField
            name="avatarUrl"
            label="Avatar (opsional)"
            folder="testimonial-avatars"
            defaultValue={initial?.avatarUrl}
            aspectClassName="aspect-square"
          />

          <div>
            <label className="block text-xs text-text-tertiary mb-1.5">
              Urutan
            </label>
            <input
              name="order"
              type="number"
              defaultValue={initial?.order ?? 0}
              className={inputClass}
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
              Tersimpan.
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-purple px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isPending && <Loader2 size={15} className="animate-spin" />}
              Simpan
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-5 py-2.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
