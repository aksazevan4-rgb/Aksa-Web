"use client";

import { useState, useTransition } from "react";
import { Laptop, Smartphone, X } from "lucide-react";
import { deviceLabel } from "./SecurityPanel";
import { revokeTrustedDeviceAction } from "@/features/two-factor/server/actions";

export interface TrustedDeviceItem {
  id: string;
  userAgent: string | null;
  expiresAt: string;
  lastUsedAt: string | null;
  createdAt: string;
}

/** Dipisah dari badan komponen — ESLint react-hooks/purity menandai
 * `Date.now()` yang dipanggil langsung di render, sama seperti fix di
 * lib/security-score.ts sebelumnya. */
function isDeviceExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}

/**
 * app/dashboard/settings/TrustedDevicesSection.tsx
 * docs/05-auth-system.md §3 — daftar device yang dipercaya (lolos 2FA
 * selama 30 hari), dengan opsi cabut kapan saja.
 */
export function TrustedDevicesSection({ devices: initialDevices }: { devices: TrustedDeviceItem[] }) {
  const [devices, setDevices] = useState(initialDevices);
  const [isPending, startTransition] = useTransition();
  const [revokingId, setRevokingId] = useState<string | null>(null);

  function handleRevoke(id: string) {
    setRevokingId(id);
    startTransition(async () => {
      await revokeTrustedDeviceAction(id);
      setDevices((prev) => prev.filter((d) => d.id !== id));
      setRevokingId(null);
    });
  }

  if (devices.length === 0) {
    return (
      <div className="glass rounded-2xl p-5">
        <p className="text-sm text-text-tertiary">
          Belum ada perangkat yang dipercaya. Centang &quot;Percaya perangkat ini&quot; saat
          memasukkan kode 2FA di login untuk menambahkannya.
        </p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-5 space-y-2">
      {devices.map((device) => {
        const { label, isMobile } = deviceLabel(device.userAgent);
        const isExpired = isDeviceExpired(device.expiresAt);
        return (
          <div
            key={device.id}
            className="flex items-center justify-between gap-3 py-2 border-b border-border/60 last:border-0"
          >
            <div className="flex items-center gap-3 min-w-0">
              {isMobile ? (
                <Smartphone size={16} className="text-text-tertiary flex-shrink-0" />
              ) : (
                <Laptop size={16} className="text-text-tertiary flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm text-text-primary truncate">{label}</p>
                <p className="text-[11px] text-text-tertiary">
                  {isExpired
                    ? "Sudah kedaluwarsa"
                    : `Dipercaya sampai ${new Date(device.expiresAt).toLocaleDateString("id-ID")}`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleRevoke(device.id)}
              disabled={isPending && revokingId === device.id}
              className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-red-400 hover:bg-red-400/10 disabled:opacity-50"
              title="Cabut kepercayaan perangkat ini"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
