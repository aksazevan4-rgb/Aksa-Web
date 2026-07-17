"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

interface UnreadMessage {
  id: string;
  name: string;
  subject: string;
  createdAt: string;
}

/**
 * Bell notifikasi sederhana: sumber datanya adalah pesan contact form
 * berstatus UNREAD (satu-satunya event "butuh perhatian admin" yang ada
 * di sistem ini saat ini). Data awal dikirim dari server (page load),
 * lalu di-refresh berkala lewat polling ringan supaya badge count tetap
 * akurat tanpa perlu infrastruktur realtime (WebSocket/SSE) yang belum
 * ada di project ini.
 */
export function NotificationBell({
  initialMessages,
}: {
  initialMessages: UnreadMessage[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Polling ringan setiap 60 detik — cukup untuk dashboard personal,
  // tanpa menambah kompleksitas WebSocket/SSE untuk kasus penggunaan ini.
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/messages/unread-count");
        if (!res.ok) return;
        const data = await res.json();
        setMessages(data.messages ?? []);
      } catch {
        // Diam-diam gagal — tidak kritikal, badge cuma tidak update kali ini.
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        title="Notifikasi"
        className="relative h-9 w-9 flex items-center justify-center rounded-full glass text-text-secondary hover:text-purple hover:border-purple/40 transition-colors"
      >
        <Bell size={17} />
        {messages.length > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {messages.length > 9 ? "9+" : messages.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-surface border border-border rounded-xl py-1 shadow-xl z-50">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-xs font-medium text-text-primary">
              Pesan Belum Dibaca
            </p>
          </div>
          {messages.length === 0 ? (
            <p className="text-xs text-text-tertiary px-3 py-4 text-center">
              Tidak ada pesan baru.
            </p>
          ) : (
            messages.slice(0, 5).map((m) => (
              <Link
                key={m.id}
                href="/dashboard/admin/content"
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 hover:bg-white/5 transition-colors border-b border-border/50 last:border-0"
              >
                <p className="text-xs font-medium text-text-primary truncate">
                  {m.name}
                </p>
                <p className="text-[11px] text-text-tertiary truncate">
                  {m.subject}
                </p>
              </Link>
            ))
          )}
          {messages.length > 0 && (
            <Link
              href="/dashboard/admin/content"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-center text-[11px] text-purple hover:bg-purple/5 transition-colors"
            >
              Lihat semua
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
