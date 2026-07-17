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
  Zap,
} from "lucide-react";
import { ThemeQuickSwitcher } from "@/components/ThemeSwitcher";
import { UserAvatar } from "@/components/UserAvatar";
import { PlanBadge } from "@/components/PlanBadge";

const NAV_ITEMS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Discord", href: "#discord" },
  { label: "Pricing", href: "#pricing" },
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
  siteName: string;
}

export default function LandingNavbar({ user, siteName }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isLoggedIn = Boolean(user);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
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
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3" aria-label={siteName}>
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-purple/30 bg-black/20 shadow-[0_0_26px_rgba(155,109,255,0.22)] transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/aksa-logo.png"
                alt={siteName}
                width={40}
                height={40}
                priority
                className="h-9 w-9 rounded-full object-contain"
              />
            </span>
            <span className="hidden sm:block font-display font-semibold text-sm tracking-wide text-text-primary">
              {siteName}
            </span>
          </Link>

          {/* Desktop nav */}
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

          {/* Desktop actions */}
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
                  <UserAvatar
                    src={user?.image}
                    name={user?.name}
                    email={user?.email}
                    sizeClassName="h-7 w-7"
                    textClassName="text-xs"
                  />
                  <span className="max-w-[110px] truncate text-text-primary font-medium text-xs">
                    {user?.name ?? user?.email}
                  </span>
                  <ChevronDown size={14} className="text-text-tertiary" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-surface border border-border rounded-xl py-1 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
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
                      Profil Saya
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                    >
                      <Settings size={15} />
                      Pengaturan
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
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors px-3 py-2"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-purple px-4 py-2 text-sm font-medium text-white hover:bg-purple-dim transition-all glow-purple hover:-translate-y-0.5"
                >
                  <Zap size={14} />
                  Mulai Gratis
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 -mr-2 text-text-primary"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden mt-2 glass rounded-2xl p-4 flex flex-col gap-1 animate-in slide-in-from-top-2 duration-150">
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
                onClick={() => setMobileOpen(false)}
                className="px-3 py-3 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors min-h-11 flex items-center"
              >
                {item.label}
              </a>
            ))}

            {isLoggedIn ? (
              <>
                <div className="mt-1 border-t border-border pt-2">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-3 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors min-h-11 flex items-center gap-2"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="w-full px-3 py-3 rounded-lg text-sm font-medium text-red-400 bg-red-400/5 flex min-h-11 items-center gap-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-1 pt-2 border-t border-border flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-3 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 min-h-11 flex items-center gap-2"
                >
                  <LogIn size={16} />
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-3 rounded-lg text-sm font-medium text-white bg-purple/90 flex min-h-11 items-center gap-2"
                >
                  <Zap size={16} />
                  Mulai Gratis
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
