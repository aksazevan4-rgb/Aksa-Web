"use client";

import { useState, useTransition } from "react";
import { Loader2, MessageSquare } from "lucide-react";
import { setNotifyGuestbookEmail } from "./actions";

export function NotificationPreferencesPanel({
  initialNotifyGuestbookEmail,
}: {
  initialNotifyGuestbookEmail: boolean;
}) {
  const [enabled, setEnabled] = useState(initialNotifyGuestbookEmail);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const next = !enabled;
    setEnabled(next);
    startTransition(() => {
      setNotifyGuestbookEmail(next);
    });
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-purple/10 border border-purple/20 flex items-center justify-center text-purple flex-shrink-0">
            <MessageSquare size={16} />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">
              Email saat ada pesan Guestbook baru
            </p>
            <p className="text-xs text-text-tertiary mt-0.5">
              Selain notifikasi di dalam dashboard, kirim juga email tiap ada pengunjung
              menulis di guestbook profilmu.
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={isPending}
          className={`relative h-6 w-11 rounded-full transition-colors flex-shrink-0 ${
            enabled ? "bg-purple" : "bg-white/10"
          }`}
        >
          {isPending ? (
            <Loader2 size={12} className="absolute inset-0 m-auto animate-spin text-white" />
          ) : (
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                enabled ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
            />
          )}
        </button>
      </div>
    </div>
  );
}
