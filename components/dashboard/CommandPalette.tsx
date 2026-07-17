"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Globe2,
  Link2,
  Blocks,
  LayoutTemplate,
  BarChart3,
  Settings,
  Shield,
  Users,
  Crown,
  FileText,
  Activity,
  Search,
  ExternalLink,
  CornerDownLeft,
  Timer,
  Flag,
  ShieldQuestion,
} from "lucide-react";

interface Command {
  label: string;
  href: string;
  icon: React.ElementType;
  group: string;
  external?: boolean;
}

function buildCommands(isAdmin: boolean, username: string | null): Command[] {
  const base: Command[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, group: "Navigasi" },
    { label: "Profil Saya", href: "/dashboard/profile", icon: User, group: "Navigasi" },
    { label: "Tampilan", href: "/dashboard/profile/appearance", icon: Globe2, group: "Navigasi" },
    { label: "Links", href: "/dashboard/profile/links", icon: Link2, group: "Navigasi" },
    { label: "Widget", href: "/dashboard/profile/widgets", icon: Blocks, group: "Navigasi" },
    { label: "Template Marketplace", href: "/dashboard/profile/templates", icon: LayoutTemplate, group: "Navigasi" },
    { label: "Analitik", href: "/dashboard/analytics", icon: BarChart3, group: "Navigasi" },
    { label: "Pengaturan", href: "/dashboard/settings", icon: Settings, group: "Navigasi" },
  ];

  const actions: Command[] = [
    { label: "Tambah Link Baru", href: "/dashboard/profile/links?new=1", icon: Link2, group: "Aksi Cepat" },
    { label: "Ganti Tema Profil", href: "/dashboard/profile/appearance", icon: Globe2, group: "Aksi Cepat" },
    { label: "Jelajahi Template", href: "/dashboard/profile/templates", icon: LayoutTemplate, group: "Aksi Cepat" },
  ];

  if (username) {
    actions.push({
      label: `Lihat Profil Publik (@${username})`,
      href: `/${username}`,
      icon: ExternalLink,
      group: "Aksi Cepat",
      external: true,
    });
  }

  const admin: Command[] = isAdmin
    ? [
        { label: "Dashboard Admin", href: "/dashboard/admin", icon: Shield, group: "Admin" },
        { label: "Kelola User", href: "/dashboard/admin/users", icon: Users, group: "Admin" },
        { label: "Premium & Paket", href: "/dashboard/admin/premium", icon: Crown, group: "Admin" },
        { label: "Analytics Platform", href: "/dashboard/admin/analytics", icon: BarChart3, group: "Admin" },
        { label: "Konten Website", href: "/dashboard/admin/content", icon: FileText, group: "Admin" },
        { label: "Konfigurasi", href: "/dashboard/admin/config", icon: Settings, group: "Admin" },
        { label: "Activity Log", href: "/dashboard/admin/logs", icon: Activity, group: "Admin" },
        { label: "Feature Flags", href: "/dashboard/admin/feature-flags", icon: Flag, group: "Admin" },
        { label: "Marketplace Moderation", href: "/dashboard/admin/moderation", icon: ShieldQuestion, group: "Admin" },
        { label: "Status Sistem", href: "/dashboard/admin/status", icon: Timer, group: "Admin" },
      ]
    : [];

  return [...base, ...actions, ...admin];
}

export function CommandPalette({
  isAdmin,
  username,
}: {
  isAdmin: boolean;
  username: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const commands = useMemo(() => buildCommands(isAdmin, username), [isAdmin, username]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    function handleOpenEvent() {
      setOpen(true);
    }
    document.addEventListener("keydown", handleKeydown);
    window.addEventListener("open-command-palette", handleOpenEvent);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("open-command-palette", handleOpenEvent);
    };
  }, []);

  // Reset pencarian & fokus terpilih setiap kali palette dibuka. Dilakukan
  // SAAT RENDER (bukan di useEffect) mengikuti pola "adjusting state when a
  // prop changes" dari React docs, supaya tidak memicu warning
  // react-hooks/set-state-in-effect akibat setState sinkron di body effect.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuery("");
      setActiveIndex(0);
    }
  }

  // Reset item terpilih setiap kali teks pencarian berubah — pola yang sama,
  // dilakukan saat render, bukan di dalam useEffect.
  const [prevQuery, setPrevQuery] = useState(query);
  if (query !== prevQuery) {
    setPrevQuery(query);
    setActiveIndex(0);
  }

  // Satu-satunya efek DOM yang tersisa (fokus input) — ini benar-benar
  // sinkronisasi ke sistem eksternal (DOM), bukan sekadar penyesuaian state,
  // jadi tetap wajar berada di useEffect. Tidak ada setState di sini.
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 10);
      return () => clearTimeout(t);
    }
  }, [open]);

  function go(cmd: Command) {
    setOpen(false);
    if (cmd.external) {
      window.open(cmd.href, "_blank");
    } else {
      router.push(cmd.href);
    }
  }

  function handleKeyNav(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[activeIndex]) go(filtered[activeIndex]);
    }
  }

  if (!open) return null;

  let lastGroup: string | null = null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4">
      <div className="w-full max-w-lg glass-bright rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search size={16} className="text-text-tertiary flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyNav}
            placeholder="Cari halaman atau aksi..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
          />
          <kbd className="text-[10px] text-text-tertiary border border-border rounded px-1.5 py-0.5">
            Esc
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto py-1.5">
          {filtered.length === 0 ? (
            <p className="text-xs text-text-tertiary text-center py-8">
              Tidak ada hasil untuk &quot;{query}&quot;.
            </p>
          ) : (
            filtered.map((cmd, i) => {
              const showGroupHeader = cmd.group !== lastGroup;
              lastGroup = cmd.group;
              const Icon = cmd.icon;
              return (
                <div key={cmd.href + cmd.label}>
                  {showGroupHeader && (
                    <p className="px-4 pt-2.5 pb-1 text-[10px] font-medium text-text-tertiary uppercase tracking-wide">
                      {cmd.group}
                    </p>
                  )}
                  <button
                    onClick={() => go(cmd)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${
                      i === activeIndex
                        ? "bg-purple/10 text-text-primary"
                        : "text-text-secondary hover:bg-white/5"
                    }`}
                  >
                    <Icon size={15} className="flex-shrink-0" />
                    <span className="flex-1 truncate">{cmd.label}</span>
                    {i === activeIndex && (
                      <CornerDownLeft size={12} className="text-text-tertiary flex-shrink-0" />
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
