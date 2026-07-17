"use client";

import { useState, useTransition } from "react";
import {
  Sparkles,
  Check,
  Loader2,
  Trash2,
  Globe,
  Lock,
  Link2 as LinkIcon2,
  Save,
  Crown,
} from "lucide-react";
import {
  applyTemplate,
  saveCurrentProfileAsTemplate,
  updateTemplateVisibility,
  deleteTemplate,
} from "./actions";
import { PROFILE_THEMES } from "@/lib/profile-themes";

interface PublicTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  isBuiltIn: boolean;
  price: number | null;
  useCount: number;
  layoutKey: string;
  themeKey: string;
  author: string | null;
}

interface MyTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  visibility: "PRIVATE" | "UNLISTED" | "PUBLIC";
  isBuiltIn: boolean;
  useCount: number;
  layoutKey: string;
  themeKey: string;
}

const VISIBILITY_LABEL: Record<MyTemplate["visibility"], { label: string; icon: React.ElementType }> = {
  PRIVATE: { label: "Privat", icon: Lock },
  UNLISTED: { label: "Unlisted (link saja)", icon: LinkIcon2 },
  PUBLIC: { label: "Publik", icon: Globe },
};

export function TemplatesClient({
  publicTemplates,
  myTemplates: initialMyTemplates,
}: {
  publicTemplates: PublicTemplate[];
  myTemplates: MyTemplate[];
}) {
  const [tab, setTab] = useState<"explore" | "mine">("explore");
  const [myTemplates, setMyTemplates] = useState(initialMyTemplates);
  const [isPending, startTransition] = useTransition();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; type: "ok" | "err"; text: string } | null>(null);

  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveDesc, setSaveDesc] = useState("");

  function handleApply(id: string) {
    setActiveId(id);
    setFeedback(null);
    startTransition(async () => {
      const result = await applyTemplate(id);
      setFeedback({
        id,
        type: result.success ? "ok" : "err",
        text: result.success ? "Diterapkan ke profilmu!" : result.error ?? "Gagal menerapkan.",
      });
      setActiveId(null);
    });
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!saveName.trim()) return;
    startTransition(async () => {
      const result = await saveCurrentProfileAsTemplate(saveName, saveDesc);
      if (result.success) {
        setShowSaveForm(false);
        setSaveName("");
        setSaveDesc("");
        setTab("mine");
        // Minimal client-side append; full data will sync on next page load.
        setMyTemplates((prev) => [
          {
            id: result.id!,
            name: saveName.trim(),
            description: saveDesc.trim() || null,
            category: "Custom",
            visibility: "PRIVATE",
            isBuiltIn: false,
            useCount: 0,
            layoutKey: "-",
            themeKey: "-",
          },
          ...prev,
        ]);
      }
    });
  }

  function handleVisibility(id: string, visibility: MyTemplate["visibility"]) {
    startTransition(async () => {
      const result = await updateTemplateVisibility(id, visibility);
      if (result.success) {
        setMyTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, visibility } : t)));
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteTemplate(id);
      if (result.success) {
        setMyTemplates((prev) => prev.filter((t) => t.id !== id));
      }
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTab("explore")}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            tab === "explore" ? "bg-purple text-white" : "text-text-secondary hover:bg-white/5"
          }`}
        >
          Jelajahi
        </button>
        <button
          onClick={() => setTab("mine")}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            tab === "mine" ? "bg-purple text-white" : "text-text-secondary hover:bg-white/5"
          }`}
        >
          Milikku
        </button>
        <div className="flex-1" />
        <button
          onClick={() => setShowSaveForm((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
        >
          <Save size={13} />
          Simpan tampilan saat ini
        </button>
      </div>

      {showSaveForm && (
        <form onSubmit={handleSave} className="glass rounded-2xl p-4 space-y-3">
          <input
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="Nama template, cth: Setup Malam Ini"
            maxLength={60}
            required
            className="w-full rounded-xl bg-white/5 border border-border px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-purple/40"
          />
          <input
            value={saveDesc}
            onChange={(e) => setSaveDesc(e.target.value)}
            placeholder="Deskripsi singkat (opsional)"
            maxLength={160}
            className="w-full rounded-xl bg-white/5 border border-border px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-purple/40"
          />
          <p className="text-[11px] text-text-tertiary">
            Ini menyimpan layout, tema, border, font, background, dan susunan widget
            yang sedang aktif di profilmu sekarang. Tersimpan sebagai privat — kamu
            bisa ubah jadi publik nanti dari tab &quot;Milikku&quot;.
          </p>
          <button
            type="submit"
            disabled={isPending || !saveName.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-purple px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            Simpan Template
          </button>
        </form>
      )}

      {tab === "explore" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {publicTemplates.map((t) => {
            const theme = PROFILE_THEMES.find((th) => th.key === t.themeKey);
            return (
            <div key={t.id} className="glass rounded-2xl overflow-hidden space-y-2.5">
              <div
                className={`h-20 w-full bg-gradient-to-br ${theme?.bannerClass ?? "from-purple/40 via-blue/30 to-black"} flex items-end p-3`}
              >
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/30 text-white/90 backdrop-blur-sm capitalize">
                  {t.layoutKey}
                </span>
              </div>
              <div className="px-4 pb-4 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                    {t.name}
                    {t.isBuiltIn && <Sparkles size={12} className="text-purple" />}
                  </p>
                  {t.category && (
                    <span className="text-[10px] text-text-tertiary uppercase tracking-wide">
                      {t.category}
                    </span>
                  )}
                </div>
                {t.price ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-2 py-0.5">
                    <Crown size={9} /> {t.price.toLocaleString("id-ID")} Credits
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2 py-0.5">
                    Gratis
                  </span>
                )}
              </div>

              {t.description && (
                <p className="text-xs text-text-tertiary leading-relaxed">{t.description}</p>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-text-tertiary">
                  {t.useCount} digunakan{t.author ? ` · oleh @${t.author}` : ""}
                </span>
                <button
                  onClick={() => handleApply(t.id)}
                  disabled={isPending && activeId === t.id}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-purple px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                >
                  {isPending && activeId === t.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Check size={12} />
                  )}
                  {t.price ? "Beli & Gunakan" : "Gunakan"}
                </button>
              </div>

              {feedback?.id === t.id && (
                <p className={`text-[11px] ${feedback.type === "ok" ? "text-emerald-400" : "text-red-400"}`}>
                  {feedback.text}
                </p>
              )}
              </div>
            </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {myTemplates.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center space-y-2">
              <p className="text-sm text-text-primary">Belum ada template milikmu.</p>
              <p className="text-xs text-text-tertiary">
                Klik &quot;Simpan tampilan saat ini&quot; untuk membuat yang pertama.
              </p>
            </div>
          ) : (
            myTemplates.map((t) => {
              const VisIcon = VISIBILITY_LABEL[t.visibility].icon;
              return (
                <div key={t.id} className="glass rounded-2xl p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">{t.name}</p>
                    {t.description && (
                      <p className="text-xs text-text-tertiary truncate">{t.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={t.visibility}
                      onChange={(e) =>
                        handleVisibility(t.id, e.target.value as MyTemplate["visibility"])
                      }
                      className="rounded-lg bg-white/5 border border-border px-2.5 py-1.5 text-xs text-text-secondary outline-none"
                    >
                      <option value="PRIVATE">Privat</option>
                      <option value="UNLISTED">Unlisted</option>
                      <option value="PUBLIC">Publik</option>
                    </select>
                    <VisIcon size={13} className="text-text-tertiary" />

                    <button
                      onClick={() => handleApply(t.id)}
                      className="rounded-lg bg-purple px-3 py-1.5 text-xs font-medium text-white"
                    >
                      Pakai
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-red-400 hover:bg-red-400/5"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
