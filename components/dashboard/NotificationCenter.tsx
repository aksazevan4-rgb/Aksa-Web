"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { BellRing, CheckCheck } from "lucide-react";
import { markAllNotificationsRead, markNotificationRead } from "@/app/dashboard/notification-actions";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export function NotificationCenter({ initial }: { initial: NotificationItem[] }) {
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = items.filter((n) => !n.read).length;

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleOpenItem(item: NotificationItem) {
    setOpen(false);
    if (item.read) return;
    setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
    startTransition(() => {
      markNotificationRead(item.id);
    });
  }

  function handleMarkAll() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    startTransition(() => {
      markAllNotificationsRead();
    });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        title="Notifikasi"
        className="relative h-9 w-9 flex items-center justify-center rounded-full glass text-text-secondary hover:text-purple hover:border-purple/40 transition-colors"
      >
        <BellRing size={17} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-purple text-white text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-xl py-1 shadow-xl z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <p className="text-xs font-medium text-text-primary">Notifikasi</p>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="inline-flex items-center gap-1 text-[11px] text-purple hover:underline"
              >
                <CheckCheck size={11} />
                Tandai semua dibaca
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <p className="text-xs text-text-tertiary px-3 py-6 text-center">
              Belum ada notifikasi.
            </p>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {items.slice(0, 15).map((n) => (
                <Link
                  key={n.id}
                  href={n.link ?? "/dashboard"}
                  onClick={() => handleOpenItem(n)}
                  className={`block px-3 py-2.5 hover:bg-white/5 transition-colors border-b border-border/50 last:border-0 ${
                    n.read ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-purple flex-shrink-0" />}
                    <p className="text-xs font-medium text-text-primary truncate">{n.title}</p>
                  </div>
                  {n.body && (
                    <p className="text-[11px] text-text-tertiary truncate mt-0.5">{n.body}</p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
