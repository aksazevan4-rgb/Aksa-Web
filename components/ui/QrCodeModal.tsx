"use client";

import { useEffect, useRef, useState } from "react";
import { X, Download, Loader2 } from "lucide-react";
import QRCode from "qrcode";

interface QrCodeModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

export function QrCodeModal({ url, title, onClose }: QrCodeModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset status siap/error setiap kali `url` berubah. Dilakukan SAAT RENDER
  // (bukan di awal body useEffect) mengikuti pola React "adjusting state
  // when a prop changes", supaya tidak memicu warning
  // react-hooks/set-state-in-effect akibat setState sinkron di body effect.
  const [prevUrl, setPrevUrl] = useState(url);
  if (url !== prevUrl) {
    setPrevUrl(url);
    setReady(false);
    setError(null);
  }

  useEffect(() => {
    let cancelled = false;

    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 240,
        margin: 1,
        color: { dark: "#14141f", light: "#ffffff" },
      })
        .then(() => {
          if (!cancelled) setReady(true);
        })
        .catch(() => {
          if (!cancelled) setError("Gagal membuat QR code.");
        });
    }

    return () => {
      cancelled = true;
    };
  }, [url]);

  function handleDownload() {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `qr-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-2xl max-w-xs w-full p-6 space-y-4 relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full text-text-tertiary hover:text-text-primary hover:bg-white/5"
        >
          <X size={16} />
        </button>

        <h2 className="font-display font-semibold text-sm text-text-primary truncate pr-6">
          QR Code — {title}
        </h2>

        <div className="mx-auto h-[240px] w-[240px] rounded-xl bg-white flex items-center justify-center overflow-hidden">
          {!ready && !error && (
            <Loader2 size={20} className="animate-spin text-text-tertiary" />
          )}
          {error && <p className="text-xs text-red-500 px-4">{error}</p>}
          <canvas ref={canvasRef} className={ready ? "" : "hidden"} />
        </div>

        <p className="text-[11px] text-text-tertiary truncate">{url}</p>

        <button
          onClick={handleDownload}
          disabled={!ready}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-purple px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-dim transition-colors disabled:opacity-40"
        >
          <Download size={15} />
          Unduh PNG
        </button>
      </div>
    </div>
  );
}
