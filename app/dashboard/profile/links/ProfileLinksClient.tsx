"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Reorder } from "framer-motion";
import {
  ExternalLink,
  Eye,
  EyeOff,
  GripVertical,
  Crown,
  Pencil,
  Plus,
  Trash2,
  Link2,
  QrCode,
  Lock,
  Clock,
} from "lucide-react";
import type { ProfileLink } from "@prisma/client";
import { LinkIcon } from "@/components/LinkIcon";
import { QrCodeModal } from "@/components/ui/QrCodeModal";
import { ProfileLinkForm, type ProfileLinkFormData } from "./ProfileLinkForm";
import {
  deleteProfileLink,
  reorderProfileLinks,
  toggleProfileLinkVisible,
} from "./actions";

interface Props {
  links: ProfileLink[];
  username: string | null;
  isPremium: boolean;
  /** null = unlimited (premium/admin), number = cap (e.g. 5 for free) */
  linkLimit: number | null;
  siteUrl: string;
}

export default function ProfileLinksClient({
  links,
  username,
  isPremium,
  linkLimit,
  siteUrl,
}: Props) {
  const [items, setItems] = useState(links);
  const [editing, setEditing] = useState<ProfileLinkFormData | null | "new">(null);
  const [, startTransition] = useTransition();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [qrLink, setQrLink] = useState<ProfileLink | null>(null);
  const [showProfileQr, setShowProfileQr] = useState(false);

  const atLimit = linkLimit !== null && items.length >= linkLimit;

  function linkStatus(link: ProfileLink): "scheduled" | "expired" | null {
    const now = new Date();
    if (link.scheduledStart && now < new Date(link.scheduledStart)) return "scheduled";
    if (link.scheduledEnd && now > new Date(link.scheduledEnd)) return "expired";
    return null;
  }

  function handleReorder(newOrder: ProfileLink[]) {
    setItems(newOrder);
    startTransition(() => {
      void reorderProfileLinks(newOrder.map((l) => l.id));
    });
  }

  function toggleVisible(link: ProfileLink) {
    setItems((prev) =>
      prev.map((l) => (l.id === link.id ? { ...l, visible: !l.visible } : l))
    );
    startTransition(() => {
      void toggleProfileLinkVisible(link.id, !link.visible);
    });
  }

  function handleDelete(id: string) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setItems((prev) => prev.filter((l) => l.id !== id));
    setConfirmDeleteId(null);
    startTransition(() => {
      void deleteProfileLink(id);
    });
  }

  const totalClicks = items.reduce((sum, l) => sum + l.clicks, 0);

  return (
    <main className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-purple/10 border border-purple/20 flex items-center justify-center text-purple">
          <Link2 size={20} />
        </div>
        <div>
          <h1 className="font-display font-semibold text-xl text-text-primary">
            Link Manager
          </h1>
          <p className="text-sm text-text-tertiary">
            Tombol link yang muncul di profil publikmu.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 items-start">
        <div className="space-y-5 min-w-0">
          {/* Stats + limit */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-text-tertiary inline-flex items-center gap-1.5">
              {items.length} link
              {linkLimit !== null && ` dari ${linkLimit} maksimum`}
              {linkLimit === null && " (unlimited)"}
              {isPremium && linkLimit === null && (
                <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-400/10 border border-amber-400/20 rounded-full px-2 py-0.5">
                  <Crown size={10} /> Premium
                </span>
              )}
            </p>

            {atLimit && linkLimit !== null ? (
              <Link
                href="/dashboard/settings#premium"
                className="inline-flex items-center gap-1.5 text-xs text-amber-300 bg-amber-400/10 border border-amber-400/20 rounded-xl px-3 py-1.5 hover:bg-amber-400/15 transition-colors"
              >
                <Crown size={12} />
                Upgrade untuk link tak terbatas
              </Link>
            ) : (
              <button
                onClick={() => setEditing("new")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple px-4 py-2 text-xs font-medium text-white hover:bg-purple-dim transition-colors"
              >
                <Plus size={14} />
                Tambah Link
              </button>
            )}
          </div>

          {/* Link list */}
          {items.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-purple/10 border border-purple/20 flex items-center justify-center text-purple">
            <Link2 size={20} />
          </div>
          <p className="text-sm font-medium text-text-primary">Belum ada link</p>
          <p className="text-xs text-text-tertiary">
            Tambahkan link pertama untuk ditampilkan di profilmu.
          </p>
          <button
            onClick={() => setEditing("new")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-purple px-4 py-2 text-xs font-medium text-white hover:bg-purple-dim transition-colors"
          >
            <Plus size={13} />
            Tambah Link Pertama
          </button>
        </div>
      ) : (
        <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-2">
          {items.map((link) => (
            <Reorder.Item
              key={link.id}
              value={link}
              className={`glass rounded-2xl px-3 sm:px-4 py-3.5 flex items-center gap-2 sm:gap-3 select-none ${
                !link.visible ? "opacity-60" : ""
              }`}
            >
              {/* Drag handle */}
              <GripVertical
                size={16}
                className="text-text-tertiary cursor-grab active:cursor-grabbing flex-shrink-0"
              />

              {/* Icon */}
              <div className="h-8 w-8 rounded-lg bg-white/5 border border-border flex items-center justify-center flex-shrink-0">
                <LinkIcon icon={link.icon} size={15} className="text-text-secondary" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {link.label}
                  </p>
                  {link.passwordHash && (
                    <span title="Dilindungi password" className="text-text-tertiary">
                      <Lock size={11} />
                    </span>
                  )}
                  {linkStatus(link) === "scheduled" && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-blue bg-blue/10 border border-blue/20 rounded-full px-1.5 py-0.5">
                      <Clock size={9} /> Terjadwal
                    </span>
                  )}
                  {linkStatus(link) === "expired" && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-red-400 bg-red-400/10 border border-red-400/20 rounded-full px-1.5 py-0.5">
                      <Clock size={9} /> Kedaluwarsa
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-tertiary truncate">
                  {link.description || link.url}
                </p>
              </div>

              {/* Click count — disembunyikan di layar sangat sempit supaya baris tidak sesak */}
              <span className="hidden sm:inline text-xs text-text-tertiary flex-shrink-0 tabular-nums">
                {link.clicks} klik
              </span>

              {/* Actions */}
              <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                <button
                  onClick={() => setQrLink(link)}
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-white/5 transition-colors"
                  title="QR Code"
                >
                  <QrCode size={13} />
                </button>

                <button
                  onClick={() =>
                    setEditing({
                      id: link.id,
                      label: link.label,
                      url: link.url,
                      icon: link.icon ?? undefined,
                      visible: link.visible,
                      description: link.description ?? undefined,
                      color: link.color ?? undefined,
                      openInNewTab: link.openInNewTab,
                      hasPassword: Boolean(link.passwordHash),
                      scheduledStart: link.scheduledStart
                        ? new Date(link.scheduledStart).toISOString().slice(0, 16)
                        : undefined,
                      scheduledEnd: link.scheduledEnd
                        ? new Date(link.scheduledEnd).toISOString().slice(0, 16)
                        : undefined,
                    })
                  }
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-white/5 transition-colors"
                  title="Edit"
                >
                  <Pencil size={13} />
                </button>

                <button
                  onClick={() => toggleVisible(link)}
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-white/5 transition-colors"
                  title={link.visible ? "Sembunyikan" : "Tampilkan"}
                >
                  {link.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>

                <button
                  onClick={() => handleDelete(link.id)}
                  className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${
                    confirmDeleteId === link.id
                      ? "bg-red-400/15 text-red-400 border border-red-400/30"
                      : "text-text-tertiary hover:text-red-400 hover:bg-red-400/5"
                  }`}
                  title={confirmDeleteId === link.id ? "Klik lagi untuk konfirmasi" : "Hapus"}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

          {/* Free limit reached banner */}
          {atLimit && linkLimit !== null && (
            <div className="glass rounded-2xl p-5 flex items-center gap-4 border border-amber-400/20 bg-amber-400/5">
              <Crown size={18} className="text-amber-300 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-primary">
                  Batas {linkLimit} link tercapai
                </p>
                <p className="text-xs text-text-tertiary mt-0.5">
                  Upgrade ke Premium untuk menambah link tanpa batas.
                </p>
              </div>
              <Link
                href="/dashboard/settings#premium"
                className="flex-shrink-0 rounded-xl bg-amber-400/15 border border-amber-400/30 px-3 py-2 text-xs font-medium text-amber-300 hover:bg-amber-400/20 transition-colors"
              >
                Upgrade
              </Link>
            </div>
          )}
        </div>

        {/* Sticky sidebar — ringkasan link + akses cepat ke profil publik */}
        <div className="xl:sticky xl:top-24 space-y-4">
          <div className="glass rounded-2xl p-5 space-y-4">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-text-tertiary">
              Ringkasan Link
            </p>

            <dl className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <dt className="text-text-tertiary">Total Link</dt>
                <dd className="text-text-primary font-medium">
                  {items.length}
                  {linkLimit !== null ? ` / ${linkLimit}` : ""}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-text-tertiary">Total Klik</dt>
                <dd className="text-text-primary font-medium tabular-nums">{totalClicks}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-text-tertiary">Plan</dt>
                <dd
                  className={`font-medium flex items-center gap-1 ${
                    isPremium ? "text-amber-300" : "text-text-primary"
                  }`}
                >
                  {isPremium && <Crown size={11} />}
                  {isPremium ? "Premium" : "Free"}
                </dd>
              </div>
            </dl>

            <div className="space-y-2 pt-1">
              {username && (
                <button
                  onClick={() => setShowProfileQr(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-border px-4 py-2.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
                >
                  <QrCode size={13} />
                  QR Profil
                </button>
              )}
              {username && (
                <Link
                  href={`/${username}`}
                  target="_blank"
                  className="flex items-center justify-center gap-2 rounded-xl bg-purple/10 border border-purple/25 px-4 py-2.5 text-xs font-medium text-purple hover:bg-purple/20 transition-colors"
                >
                  Buka Profil Publik
                  <ExternalLink size={12} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit form modal */}
      {editing !== null && (
        <ProfileLinkForm
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(link: ProfileLink) => {
            if (editing === "new") {
              setItems((prev) => [...prev, link]);
            } else {
              // `link` sudah record ProfileLink lengkap hasil Prisma update(),
              // jadi cukup ganti seluruh entri lama dengannya — tidak perlu
              // spread-merge dengan data form (yang tipenya berbeda) maupun
              // type assertion.
              setItems((prev) => prev.map((l) => (l.id === link.id ? link : l)));
            }
            setEditing(null);
          }}
        />
      )}

      {/* QR code modal — per link */}
      {qrLink && (
        <QrCodeModal
          url={`${siteUrl.replace(/\/$/, "")}/l/${qrLink.id}`}
          title={qrLink.label}
          onClose={() => setQrLink(null)}
        />
      )}

      {/* QR code modal — whole profile */}
      {showProfileQr && username && (
        <QrCodeModal
          url={`${siteUrl.replace(/\/$/, "")}/${username}`}
          title={`Profil @${username}`}
          onClose={() => setShowProfileQr(false)}
        />
      )}
    </main>
  );
}
