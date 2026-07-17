"use client";

import { useState } from "react";
import { Loader2, ShieldQuestion, Check, X } from "lucide-react";
import { approveTemplateAction, rejectTemplateAction } from "@/features/marketplace/server/actions";

interface PendingItem {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number | null;
  updatedAt: string;
  authorUsername: string | null;
  authorName: string | null;
}

export function ModerationClient({ items: initialItems }: { items: PendingItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleApprove(id: string) {
    setPendingId(id);
    const result = await approveTemplateAction(id);
    if (result.success) setItems((prev) => prev.filter((i) => i.id !== id));
    setPendingId(null);
  }

  async function handleReject(id: string) {
    setPendingId(id);
    const result = await rejectTemplateAction(id);
    if (result.success) setItems((prev) => prev.filter((i) => i.id !== id));
    setPendingId(null);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display font-semibold text-xl text-text-primary flex items-center gap-2">
          <ShieldQuestion size={18} className="text-purple" /> Marketplace Moderation
        </h1>
        <p className="text-sm text-text-tertiary mt-1">
          Template yang menunggu review sebelum tampil di Marketplace publik.
        </p>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-text-tertiary">Tidak ada item yang menunggu review.</p>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="glass rounded-2xl p-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary">{item.name}</p>
                <p className="text-xs text-text-tertiary">
                  oleh @{item.authorUsername ?? "unknown"}
                  {item.category ? ` · ${item.category}` : ""}
                  {item.price ? ` · ${item.price} Credits` : " · Gratis"}
                </p>
              </div>
            </div>
            {item.description && (
              <p className="text-xs text-text-secondary">{item.description}</p>
            )}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleApprove(item.id)}
                disabled={pendingId === item.id}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:opacity-90 disabled:opacity-60"
              >
                {pendingId === item.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                Setujui
              </button>
              <button
                type="button"
                onClick={() => handleReject(item.id)}
                disabled={pendingId === item.id}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:opacity-90 disabled:opacity-60"
              >
                <X size={12} />
                Tolak
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
