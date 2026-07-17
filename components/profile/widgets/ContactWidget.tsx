"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

interface State {
  success?: boolean;
  error?: string;
}

// Inline server action called client-side via useActionState.
// Actual implementation lives in app/api/contact/route.ts or a dedicated
// server action — this component just calls the shared action by path.
async function sendContactMessage(_prev: State, formData: FormData): Promise<State> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const targetUserId = String(formData.get("targetUserId") ?? "");

  if (!name || !email || !message) return { error: "Semua field wajib diisi." };
  if (message.length < 10) return { error: "Pesan terlalu pendek." };

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message, targetUserId }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { error: (data as { error?: string }).error ?? "Gagal mengirim pesan." };
    }
    return { success: true };
  } catch {
    return { error: "Koneksi gagal. Coba lagi." };
  }
}

const inputClass =
  "w-full rounded-xl bg-white/5 border border-border px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-purple/40 outline-none transition-colors";

export function ContactWidget({
  targetUserId,
  accentHex = "#9b6dff",
}: {
  targetUserId: string;
  accentHex?: string;
}) {
  const [state, formAction, isPending] = useActionState(sendContactMessage, {});

  if (state.success) {
    return (
      <div className="glass rounded-2xl p-6 text-center space-y-2">
        <CheckCircle2 size={28} className="mx-auto text-emerald-400" />
        <p className="text-sm font-medium text-text-primary">Pesan terkirim!</p>
        <p className="text-xs text-text-tertiary">Pemilik profil akan membalas secepatnya.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <p className="text-sm font-semibold text-text-primary">Hubungi saya</p>
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="targetUserId" value={targetUserId} />
        <input name="name" placeholder="Nama kamu" required className={inputClass} />
        <input name="email" type="email" placeholder="Email" required className={inputClass} />
        <textarea
          name="message"
          rows={3}
          placeholder="Pesan..."
          required
          className={`${inputClass} resize-none`}
        />
        {state.error && (
          <p className="text-xs text-red-400">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-60"
          style={{ background: accentHex }}
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Kirim Pesan
        </button>
      </form>
    </div>
  );
}
