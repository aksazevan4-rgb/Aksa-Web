"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Search, X } from "lucide-react";
import type { ProfileLink } from "@prisma/client";
import { upsertProfileLink } from "./actions";
import { LINK_ICON_OPTIONS, LinkIcon } from "@/components/LinkIcon";

export interface ProfileLinkFormData {
  id?: string;
  label: string;
  url: string;
  icon?: string;
  visible?: boolean;
  description?: string;
  color?: string;
  openInNewTab?: boolean;
  hasPassword?: boolean;
  scheduledStart?: string;
  scheduledEnd?: string;
}

const inputClass =
  "w-full rounded-xl bg-white/5 border border-border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-purple/40 outline-none transition-colors";

export function ProfileLinkForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: ProfileLinkFormData | null;
  onClose: () => void;
  /**
   * Dipanggil dengan object ProfileLink LENGKAP (hasil Prisma create/update),
   * bukan ProfileLinkFormData. `state.link` berasal dari ActionResult yang
   * sekarang mengembalikan record Prisma apa adanya, jadi tipe di sini
   * harus mengikuti itu — bukan bentuk data form.
   */
  onSaved?: (link: ProfileLink) => void;
}) {
  const [state, formAction, isPending] = useActionState(upsertProfileLink, {});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [clearPassword, setClearPassword] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(initial?.icon ?? "link");
  const [iconSearch, setIconSearch] = useState("");

  const filteredIconGroups = useMemo(() => {
    const q = iconSearch.trim().toLowerCase();
    const matches = q
      ? LINK_ICON_OPTIONS.filter(
          (o) => o.label.toLowerCase().includes(q) || o.key.toLowerCase().includes(q)
        )
      : LINK_ICON_OPTIONS;
    const groups = Array.from(new Set(matches.map((o) => o.group)));
    return groups.map((group) => ({
      group,
      options: matches.filter((o) => o.group === group),
    }));
  }, [iconSearch]);

  useEffect(() => {
    if (state.success) {
      if (state.link) onSaved?.(state.link);
      const t = setTimeout(onClose, 500);
      return () => clearTimeout(t);
    }
  }, [state.success, state.link, onSaved, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-bright rounded-2xl max-w-lg w-full p-6 my-8 space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full text-text-tertiary hover:text-text-primary hover:bg-white/5"
        >
          <X size={16} />
        </button>

        <h2 className="font-display font-semibold text-lg text-text-primary">
          {initial?.id ? "Edit Tombol Link" : "Tambah Tombol Link"}
        </h2>

        <form action={formAction} className="space-y-4">
          {initial?.id && <input type="hidden" name="id" value={initial.id} />}

          <div>
            <label className="block text-xs text-text-tertiary mb-1.5">
              Label Tombol
            </label>
            <input
              name="label"
              defaultValue={initial?.label ?? ""}
              placeholder="cth: Order via WhatsApp"
              maxLength={40}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs text-text-tertiary mb-1.5">
              URL Tujuan
            </label>
            <input
              name="url"
              defaultValue={initial?.url ?? ""}
              placeholder="https:// , mailto: , atau tel:"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs text-text-tertiary mb-1.5">
              Deskripsi singkat <span className="text-text-tertiary/70">(opsional)</span>
            </label>
            <input
              name="description"
              defaultValue={initial?.description ?? ""}
              placeholder="Muncul di bawah label, cth: Respon cepat 24 jam"
              maxLength={140}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs text-text-tertiary mb-1.5">
              Ikon
            </label>
            <input type="hidden" name="icon" value={selectedIcon} />

            <div className="rounded-xl border border-border bg-white/[0.02] p-3 space-y-3">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="text"
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                  placeholder="Cari ikon... (cth: whatsapp)"
                  className="w-full rounded-lg bg-white/5 border border-border pl-8 pr-3 py-2 text-xs text-text-primary placeholder:text-text-tertiary focus:border-purple/40 outline-none transition-colors"
                />
              </div>

              <div className="max-h-52 overflow-y-auto space-y-3 pr-1">
                {filteredIconGroups.length === 0 && (
                  <p className="text-xs text-text-tertiary text-center py-4">
                    Tidak ada ikon yang cocok.
                  </p>
                )}
                {filteredIconGroups.map(({ group, options }) => (
                  <div key={group}>
                    <p className="text-[10px] font-semibold tracking-widest uppercase text-text-tertiary mb-1.5">
                      {group}
                    </p>
                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
                      {options.map((opt) => {
                        const active = selectedIcon === opt.key;
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            title={opt.label}
                            onClick={() => setSelectedIcon(opt.key)}
                            className={`aspect-square rounded-lg flex items-center justify-center border transition-all ${
                              active
                                ? "bg-purple/20 border-purple text-purple scale-105"
                                : "bg-white/5 border-border text-text-secondary hover:text-text-primary hover:border-purple/30"
                            }`}
                          >
                            <LinkIcon icon={opt.key} size={16} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-text-tertiary pt-1 border-t border-border">
                <span className="h-7 w-7 rounded-lg bg-purple/15 border border-purple/25 flex items-center justify-center text-purple flex-shrink-0">
                  <LinkIcon icon={selectedIcon} size={14} />
                </span>
                <span>
                  Dipilih:{" "}
                  <span className="text-text-primary font-medium">
                    {LINK_ICON_OPTIONS.find((o) => o.key === selectedIcon)?.label ?? selectedIcon}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="text-xs text-purple hover:underline"
          >
            {showAdvanced ? "Sembunyikan opsi lanjutan" : "Tampilkan opsi lanjutan"}
            {" "}(warna, password, jadwal)
          </button>

          {showAdvanced && (
            <div className="space-y-4 rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-text-tertiary mb-1.5">
                    Warna tombol <span className="text-text-tertiary/70">(opsional)</span>
                  </label>
                  <input
                    type="color"
                    name="color"
                    defaultValue={initial?.color ?? "#9b6dff"}
                    className="h-10 w-full rounded-xl bg-white/5 border border-border cursor-pointer"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs text-text-secondary pt-5">
                  <input
                    type="checkbox"
                    name="openInNewTab"
                    defaultChecked={initial?.openInNewTab ?? true}
                    className="accent-purple"
                  />
                  Buka tab baru
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-text-tertiary mb-1.5">
                    Mulai tampil
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduledStart"
                    defaultValue={initial?.scheduledStart ?? ""}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-tertiary mb-1.5">
                    Berakhir
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduledEnd"
                    defaultValue={initial?.scheduledEnd ?? ""}
                    className={inputClass}
                  />
                </div>
              </div>
              <p className="text-[11px] text-text-tertiary -mt-2">
                Kosongkan kalau link tidak perlu dijadwalkan/kedaluwarsa.
              </p>

              <div>
                <label className="block text-xs text-text-tertiary mb-1.5">
                  {initial?.hasPassword ? "Ganti password link" : "Password link"}{" "}
                  <span className="text-text-tertiary/70">(opsional)</span>
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder={initial?.hasPassword ? "Kosongkan agar tidak berubah" : "Kosongkan jika tidak perlu"}
                  minLength={4}
                  disabled={clearPassword}
                  className={`${inputClass} disabled:opacity-40`}
                />
                {initial?.hasPassword && (
                  <label className="flex items-center gap-2 text-xs text-text-tertiary mt-2">
                    <input
                      type="checkbox"
                      name="clearPassword"
                      checked={clearPassword}
                      onChange={(e) => setClearPassword(e.target.checked)}
                      className="accent-purple"
                    />
                    Hapus password (link jadi terbuka untuk semua orang)
                  </label>
                )}
              </div>
            </div>
          )}

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
