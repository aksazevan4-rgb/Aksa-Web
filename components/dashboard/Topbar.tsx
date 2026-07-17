"use client";

import { useState, useRef, useEffect } from "react";
import {
  BarChart3,
  Blocks,
  ChevronDown,
  Link2,
  LogOut,
  Palette,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { NotificationCenter, type NotificationItem } from "@/components/dashboard/NotificationCenter";
import { UserAvatar } from "@/components/UserAvatar";
import { PlanBadge } from "@/components/PlanBadge";
import { useSidebarCollapse } from "@/components/dashboard/SidebarCollapseContext";

interface UnreadMessage {
  id: string;
  name: string;
  subject: string;
  createdAt: string;
}

interface Props {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: "ADMIN" | "USER";
    plan?: "FREE" | "PREMIUM";
    isFounder?: boolean;
  };
  siteName?: string;
  unreadMessages?: UnreadMessage[];
  notifications?: NotificationItem[];
}

const USER_MENU = [
  { label: "Profil Saya", href: "/dashboard/profile", icon: User },
  { label: "Tampilan", href: "/dashboard/profile/appearance", icon: Palette },
  { label: "Links", href: "/dashboard/profile/links", icon: Link2 },
  { label: "Widget", href: "/dashboard/profile/widgets", icon: Blocks },
  { label: "Analitik", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Pengaturan", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardTopbar({
  user,
  siteName = "AKSA",
  unreadMessages = [],
  notifications = [],
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { collapsed } = useSidebarCollapse();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-30 h-16 flex items-center justify-between px-4 sm:px-5 md:px-8 bg-bg/80 backdrop-blur-md border-b border-border transition-all duration-300 ${
        collapsed ? "md:left-16" : "md:left-64"
      }`}
    >
      {/* Left: breadcrumb / title */}
      <div className="ml-10 md:ml-0">
        <span className="font-display font-semibold text-text-primary text-sm">
          {siteName}
        </span>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        {user.role === "ADMIN" && (
          <NotificationBell initialMessages={unreadMessages} />
        )}
        <NotificationCenter initial={notifications} />
        <button
          onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
          title="Command Palette"
          className="hidden sm:inline-flex items-center gap-1.5 h-9 rounded-full glass px-3 text-xs text-text-tertiary hover:text-text-primary transition-colors"
        >
          <kbd className="text-[10px]">⌘K</kbd>
        </button>

        {/* User dropdown */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu akun"
            aria-expanded={open}
            className="flex items-center gap-2 rounded-xl glass px-3 py-2 text-sm hover:border-purple/30 transition-colors"
          >
            <UserAvatar
              src={user.image}
              name={user.name}
              email={user.email}
              sizeClassName="h-[26px] w-[26px]"
              textClassName="text-xs"
            />
            <span className="hidden sm:block text-text-primary font-medium max-w-[120px] truncate text-xs">
              {user.name ?? user.email}
            </span>
            <span className="hidden sm:block">
              <PlanBadge
                user={{
                  role: user.role ?? "USER",
                  plan: user.plan ?? "FREE",
                  isFounder: Boolean(user.isFounder),
                }}
              />
            </span>
            <ChevronDown size={14} className="text-text-tertiary" />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-52 glass rounded-xl py-1 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs font-medium text-text-primary truncate">
                  {user.name}
                </p>
                <p className="text-[11px] text-text-tertiary truncate">
                  {user.email}
                </p>
              </div>

              {USER_MENU.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                >
                  <Icon size={14} className="flex-shrink-0" />
                  {label}
                </Link>
              ))}

              <div className="border-t border-border mt-1 pt-1">
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text-tertiary hover:text-red-400 hover:bg-red-400/5 transition-colors"
                >
                  <LogOut size={14} />
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
