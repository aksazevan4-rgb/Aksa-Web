"use client";

import { useState, useTransition } from "react";
import { Laptop, LogOut, MapPin, Smartphone } from "lucide-react";
import { logoutAllDevices } from "@/app/dashboard/settings/actions";

interface ActiveSessionItem {
  jti: string;
  ipAddress: string | null;
  userAgent: string | null;
  lastUsedAt: string;
  isCurrent: boolean;
}

interface LoginHistoryItem {
  id: string;
  success: boolean;
  method: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface SecurityPanelProps {
  activeSessions: ActiveSessionItem[];
  loginHistory: LoginHistoryItem[];
  lastLoginAt: string | null;
  lastLoginIp: string | null;
}

export function deviceLabel(userAgent: string | null): { label: string; isMobile: boolean } {
  if (!userAgent) return { label: "Perangkat tidak dikenal", isMobile: false };
  const isMobile = /Mobile|Android|iPhone/i.test(userAgent);
  let browser = "Browser";
  if (userAgent.includes("Edg/")) browser = "Edge";
  else if (userAgent.includes("Chrome/")) browser = "Chrome";
  else if (userAgent.includes("Firefox/")) browser = "Firefox";
  else if (userAgent.includes("Safari/")) browser = "Safari";

  let os = "";
  if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Mac OS")) os = "macOS";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) os = "iOS";
  else if (userAgent.includes("Linux")) os = "Linux";

  return { label: os ? `${browser} · ${os}` : browser, isMobile };
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function SecurityPanel({
  activeSessions,
  loginHistory,
  lastLoginAt,
  lastLoginIp,
}: SecurityPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function handleLogoutAll() {
    startTransition(async () => {
      await logoutAllDevices();
      setDone(true);
    });
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">
          Login Terakhir
        </h3>
        <div className="flex justify-between items-center py-2 border-b border-border">
          <span className="text-xs text-text-tertiary">Waktu</span>
          <span className="text-sm text-text-primary font-medium">
            {lastLoginAt ? formatDateTime(lastLoginAt) : "—"}
          </span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-xs text-text-tertiary">Alamat IP</span>
          <span className="text-sm text-text-primary font-medium font-mono">
            {lastLoginIp ?? "—"}
          </span>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">
            Sesi Aktif ({activeSessions.length})
          </h3>
          <button
            onClick={handleLogoutAll}
            disabled={isPending || done}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/30 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-400/10 disabled:opacity-50"
          >
            <LogOut size={13} />
            {done ? "Berhasil — silakan login ulang" : "Logout Semua Device"}
          </button>
        </div>

        {activeSessions.length === 0 ? (
          <p className="text-xs text-text-tertiary">Tidak ada sesi aktif tercatat.</p>
        ) : (
          <div className="space-y-2">
            {activeSessions.map((s) => {
              const { label, isMobile } = deviceLabel(s.userAgent);
              return (
                <div
                  key={s.jti}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-border"
                >
                  {isMobile ? (
                    <Smartphone size={16} className="text-text-tertiary shrink-0" />
                  ) : (
                    <Laptop size={16} className="text-text-tertiary shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary font-medium flex items-center gap-2">
                      {label}
                      {s.isCurrent && (
                        <span className="text-[9px] font-mono bg-emerald-400/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-400/20 uppercase">
                          Device ini
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-text-tertiary flex items-center gap-1 mt-0.5">
                      <MapPin size={10} />
                      {s.ipAddress ?? "IP tidak tercatat"} · Terakhir aktif{" "}
                      {formatDateTime(s.lastUsedAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">
          Riwayat Login
        </h3>
        {loginHistory.length === 0 ? (
          <p className="text-xs text-text-tertiary">Belum ada riwayat login.</p>
        ) : (
          <div className="space-y-2">
            {loginHistory.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div>
                  <p className="text-sm text-text-primary">
                    {h.method === "credentials" ? "Email & Password" : h.method}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {h.ipAddress ?? "IP tidak tercatat"}
                  </p>
                </div>
                <span className="text-xs text-text-tertiary">
                  {formatDateTime(h.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
