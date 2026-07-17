"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  ChevronDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Settings,
  User,
  X,
} from "lucide-react";

import { ThemeQuickSwitcher } from "@/components/ThemeSwitcher";
import { UserAvatar } from "@/components/UserAvatar";
import { PlanBadge } from "@/components/PlanBadge";

const NAV_ITEMS = [
  { label: "Ecosystem", href: "#ecosystem" },
  { label: "Projects", href: "#projects" },
  { label: "Stack", href: "#stack" },
  { label: "Connect", href: "#connect" },
];

interface NavbarUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: "ADMIN" | "USER";
  plan?: "FREE" | "PREMIUM";
  isFounder?: boolean;
}

interface Props {
  user?: NavbarUser | null;
}

export default function Navbar({ user }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isLoggedIn = Boolean(user);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div className="mx-auto max-w-6xl px-5">
        <nav
          className={`flex items-center justify-between rounded-2xl px-4 py-3 transition-all duration-300 ${
            scrolled ? "glass" : ""
          }`}
        >
          <a href="#top" className="group flex items-center gap-3" aria-label="AKSA home">
            <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-blue/30 bg-black/20 shadow-[0_0_26px_rgba(59,130,246,0.22)] transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/aksa-logo.png"
                alt="AKSA"
                width={44}
                height={44}
                priority
                className="h-10 w-10 rounded-full object-contain"
              />
            </span>
            <span className="hidden sm:block font-display font-semibold text-sm tracking-wide text-text-primary">
              AKSA<span className="text-blue">.</span>ID
            </span>
          </a>

          <ul className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-3">
            <ThemeQuickSwitcher />
            {isLoggedIn ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label="Menu profil"
                  aria-expanded={menuOpen}
                  className="flex items-center gap-2 rounded-full glass pl-1.5 pr-3 py-1.5 text-sm transition-all duration-300 hover:border-purple/40"
                >
                  {user?.image ? (
                    <UserAvatar
                      src={user.image}
                      name={user.name}
                      email={user.email}
                      sizeClassName="h-7 w-7"
                      textClassName="text-xs"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-purple/20 flex items-center justify-center text-purple text-xs font-semibold">
                      {(user?.name ?? user?.email ?? "U")[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[110px] truncate text-text-primary font-medium text-xs">
                    {user?.name ?? user?.email}
                  </span>
                  <ChevronDown size={14} className="text-text-tertiary" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-surface border border-border rounded-xl py-1 shadow-xl z-50">
                    <div className="px-3 py-2 border-b border-border">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-medium text-text-primary truncate">
                          {user?.name}
                        </p>
                        {user?.role && (
                          <PlanBadge
                            user={{
                              role: user.role,
                              plan: user.plan ?? "FREE",
                              isFounder: Boolean(user.isFounder),
                            }}
                          />
                        )}
                      </div>
                      <p className="text-[11px] text-text-tertiary truncate">
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                    >
                      <LayoutDashboard size={15} />
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                    >
                      <User size={15} />
                      Profile
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                    >
                      <Settings size={15} />
                      Settings
                    </Link>
                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text-tertiary hover:text-red-400 hover:bg-red-400/5 transition-colors"
                      >
                        <LogOut size={15} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login?callbackUrl=%2Fdashboard"
                aria-label="Masuk ke dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-purple/35 bg-purple/10 px-4 py-2 text-sm font-medium text-purple transition-all duration-300 hover:-translate-y-0.5 hover:bg-purple/20 hover:text-text-primary hover:shadow-[0_0_26px_rgba(139,92,246,0.18)]"
              >
                <LogIn size={16} />
                Masuk
              </Link>
            )}
          </div>

          <button
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 -mr-2 text-text-primary"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {open && (
          <div className="md:hidden mt-2 glass rounded-2xl p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between px-3 pb-2">
              <span className="text-xs font-medium text-text-tertiary uppercase tracking-wide">
                Tema
              </span>
              <ThemeQuickSwitcher />
            </div>
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="px-3 py-3 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors min-h-11 flex items-center"
              >
                {item.label}
              </a>
            ))}

            {isLoggedIn ? (
              <>
                <div className="mt-1 px-3 py-3 flex items-center gap-2.5 border-t border-border">
                  {user?.image ? (
                    <UserAvatar
                      src={user.image}
                      name={user.name}
                      email={user.email}
                      sizeClassName="h-7 w-7"
                      textClassName="text-xs"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-purple/20 flex items-center justify-center text-purple text-xs font-semibold">
                      {(user?.name ?? user?.email ?? "U")[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">
                      {user?.name ?? user?.email}
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="px-3 py-3 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors min-h-11 flex items-center gap-2"
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/profile"
                  onClick={() => setOpen(false)}
                  className="px-3 py-3 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors min-h-11 flex items-center gap-2"
                >
                  <User size={16} />
                  Profile
                </Link>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setOpen(false)}
                  className="px-3 py-3 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors min-h-11 flex items-center gap-2"
                >
                  <Settings size={16} />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="mt-1 px-3 py-3 rounded-lg text-sm font-medium text-red-400 bg-red-400/5 flex min-h-11 items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login?callbackUrl=%2Fdashboard"
                onClick={() => setOpen(false)}
                className="mt-1 px-3 py-3 rounded-lg text-sm font-medium text-purple bg-purple/10 flex min-h-11 items-center gap-2"
              >
                <LogIn size={16} />
                Masuk
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
