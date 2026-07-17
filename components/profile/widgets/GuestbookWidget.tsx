"use client";

import { useState, useTransition } from "react";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { postGuestbookMessage } from "@/app/[username]/public-actions";

export interface GuestbookEntryItem {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

interface Props {
  userId: string;
  entries: GuestbookEntryItem[];
  accentHex?: string;
}

export function GuestbookWidget({ userId, entries, accentHex = "#9b6dff" }: Props) {
  const [items, setItems] = useState(entries);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setError(null);

    startTransition(async () => {
      const result = await postGuestbookMessage(userId, name, message);
      if (result.error) {
        setError(result.error);
        return;
      }
      setItems((prev) => [
        { id: `local-${Date.now()}`, name: name.trim(), message: message.trim(), createdAt: new Date().toISOString() },
        ...prev,
      ]);
      setName("");
      setMessage("");
    });
  }

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare size={15} style={{ color: accentHex }} />
        <h3 className="text-sm font-semibold text-text-primary">Guestbook</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama kamu"
          maxLength={40}
          className="w-full rounded-xl bg-white/5 border border-border px-3.5 py-2 text-xs text-text-primary placeholder:text-text-tertiary outline-none focus:border-purple/40"
        />
        <div className="flex gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tinggalkan pesan..."
            maxLength={280}
            className="flex-1 rounded-xl bg-white/5 border border-border px-3.5 py-2 text-xs text-text-primary placeholder:text-text-tertiary outline-none focus:border-purple/40"
          />
          <button
            type="submit"
            disabled={isPending || !name.trim() || !message.trim()}
            className="rounded-xl px-3.5 flex items-center justify-center text-white disabled:opacity-40 transition-opacity"
            style={{ backgroundColor: accentHex }}
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
        {error && <p className="text-[11px] text-red-400">{error}</p>}
      </form>

      {items.length > 0 && (
        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {items.map((entry) => (
            <div key={entry.id} className="rounded-xl bg-white/3 border border-border px-3.5 py-2.5">
              <p className="text-xs font-medium text-text-primary">{entry.name}</p>
              <p className="text-xs text-text-secondary mt-0.5 break-words">{entry.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
