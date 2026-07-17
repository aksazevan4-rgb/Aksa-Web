"use client";

import { useState, useTransition } from "react";
import { MessageSquare, Trash2, Loader2 } from "lucide-react";
import { deleteGuestbookEntry } from "./guestbook-actions";

interface Entry {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

export function GuestbookModeration({ entries }: { entries: Entry[] }) {
  const [items, setItems] = useState(entries);
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  function handleDelete(id: string) {
    setPendingId(id);
    startTransition(async () => {
      const result = await deleteGuestbookEntry(id);
      if (!result.error) {
        setItems((prev) => prev.filter((e) => e.id !== id));
      }
      setPendingId(null);
    });
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare size={16} className="text-purple" />
        <h3 className="text-sm font-semibold text-text-primary">
          Kelola Guestbook
        </h3>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-text-tertiary">Belum ada pesan masuk.</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {items.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-3 rounded-xl border border-border bg-white/3 px-3.5 py-2.5"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-text-primary">{entry.name}</p>
                <p className="text-xs text-text-secondary mt-0.5 break-words">
                  {entry.message}
                </p>
              </div>
              <button
                onClick={() => handleDelete(entry.id)}
                disabled={isPending && pendingId === entry.id}
                className="flex-shrink-0 h-7 w-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-red-400 hover:bg-red-400/5 transition-colors"
                title="Hapus pesan"
              >
                {isPending && pendingId === entry.id ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Trash2 size={13} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
