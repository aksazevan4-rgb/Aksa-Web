"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  Shield,
  Users,
  FileText,
  Activity,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Menu,
  X,
  Link2,
  Crown,
  Globe2,
  BarChart3,
  Blocks,
  LayoutTemplate,
  Timer,
  KeyRound,
  Flag,
  ShieldQuestion,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebarCollapse } from "./SidebarCollapseContext";

const Github = ({ size = 17 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.93c.58.11.79-.25.79-.56v-2.16c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.27-5.23-5.67 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.37-5.25 5.66.42.36.79 1.06.79 2.15v3.18c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
  </svg>
);
const Youtube = ({ size = 17 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8ZM9.75 15.5v-7l6 3.5-6 3.5Z" />
  </svg>
);

const userNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Profil Saya", href: "/dashboard/profile", icon: User },
  { label: "Tampilan", href: "/dashboard/profile/appearance", icon: Globe2 },
  { label: "Links", href: "/dashboard/profile/links", icon: Link2 },
  { label: "Widget", href: "/dashboard/profile/widgets", icon: Blocks },
  { label: "Template", href: "/dashboard/profile/templates", icon: LayoutTemplate },
  { label: "Analitik", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Developer", href: "/dashboard/developer", icon: KeyRound },
  { label: "Pengaturan", href: "/dashboard/settings", icon: Settings },
];

const adminNavItems = [
  { label: "Dashboard Admin", href: "/dashboard/admin", icon: Shield },
  { label: "Kelola User", href: "/dashboard/admin/users", icon: Users },
  { label: "Premium & Paket", href: "/dashboard/admin/premium", icon: Crown },
  { label: "Analytics Platform", href: "/dashboard/admin/analytics", icon: BarChart3 },
  { label: "Konten Website", href: "/dashboard/admin/content", icon: FileText },
  { label: "Konfigurasi", href: "/dashboard/admin/config", icon: Settings },
  { label: "Activity Log", href: "/dashboard/admin/logs", icon: Activity },
  { label: "Feature Flags", href: "/dashboard/admin/feature-flags", icon: Flag },
  { label: "Marketplace Moderation", href: "/dashboard/admin/moderation", icon: ShieldQuestion },
  { label: "Status Sistem", href: "/dashboard/admin/status", icon: Timer },
];

const INTEGRATION_ICONS = {
  discord: MessageSquare,
  youtube: Youtube,
  github: Github,
} as const;

interface IntegrationLinkInput {
  key: keyof typeof INTEGRATION_ICONS;
  label: string;
  url: string | null;
}

interface Props {
  role: string;
  siteName?: string;
  integrationLinks?: IntegrationLinkInput[];
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
  collapsed,
  onNavigate,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group ${
        active
          ? "text-purple"
          : "text-text-secondary hover:text-text-primary hover:bg-white/5"
      } ${collapsed ? "justify-center" : ""}`}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active-bg"
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple/25 via-purple/10 to-transparent border border-purple/25"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        >
          <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-gradient-to-b from-purple to-blue" />
        </motion.span>
      )}
      <Icon size={17} className="shrink-0 relative z-10" />
      {!collapsed && <span className="relative z-10">{label}</span>}
    </Link>
  );
}

function SidebarBody({
  siteName,
  collapsed,
  isAdmin,
  integrationLinks,
  isActive,
  onNavigate,
}: {
  siteName: string;
  collapsed: boolean;
  isAdmin: boolean;
  integrationLinks: IntegrationLinkInput[];
  isActive: (href: string) => boolean;
  onNavigate: () => void;
}) {
  return (
    <div className="flex flex-col h-full py-4 px-3">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-2 mb-6 ${collapsed ? "justify-center" : ""}`}>
        <Link href="/" className="flex items-center gap-3 group">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-purple/30 bg-black/20 shadow-[0_0_20px_rgba(155,109,255,0.2)] transition-transform group-hover:scale-105">
            <Image
              src="/aksa-logo.png"
              alt={siteName}
              width={36}
              height={36}
              className="h-8 w-8 rounded-full object-contain"
            />
          </span>
          {!collapsed && (
            <span className="font-display font-semibold text-sm text-text-primary">
              {siteName}
            </span>
          )}
        </Link>
      </div>

      {/* User section */}
      <div className="px-1 space-y-1 mb-2">
        {!collapsed && (
          <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest uppercase text-text-tertiary">
            Menu
          </p>
        )}
        {userNavItems.map((item) => (
          <NavItem key={item.href} {...item} active={isActive(item.href)} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </div>

      {/* Admin section */}
      {isAdmin && (
        <div className="px-1 space-y-1 mt-4 mb-2">
          {!collapsed && (
            <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest uppercase text-text-tertiary">
              Admin
            </p>
          )}
          {adminNavItems.map((item) => (
            <NavItem key={item.href} {...item} active={isActive(item.href)} collapsed={collapsed} onNavigate={onNavigate} />
          ))}
        </div>
      )}

      {/* Integrasi sosial */}
      {integrationLinks.some((item) => item.url) && (
        <div className="px-1 mt-4">
          {!collapsed && (
            <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest uppercase text-text-tertiary">
              Integrasi
            </p>
          )}
          {integrationLinks
            .filter((item) => item.url)
            .map((item) => {
              const Icon = INTEGRATION_ICONS[item.key];
              return (
                <a
                  key={item.key}
                  href={item.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors ${
                    collapsed ? "justify-center" : ""
                  }`}
                >
                  <Icon size={17} />
                  {!collapsed && <span>{item.label}</span>}
                </a>
              );
            })}
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Logout */}
      <div className="px-1 pt-4 border-t border-border">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-tertiary hover:text-red-400 hover:bg-red-400/5 transition-all duration-200 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={17} className="shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>
    </div>
  );
}

export default function DashboardSidebar({
  role,
  siteName = "AKSA",
  integrationLinks = [],
}: Props) {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebarCollapse();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = role === "ADMIN";

  const isActive = (href: string) =>
    href === "/dashboard" || href === "/dashboard/profile"
      ? pathname === href
      : pathname.startsWith(href);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen((v) => !v)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 glass rounded-xl text-text-primary"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-30 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-40 w-64 glass border-r-0 transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarBody siteName={siteName} collapsed={collapsed} isAdmin={isAdmin} integrationLinks={integrationLinks} isActive={isActive} onNavigate={() => setMobileOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex fixed inset-y-0 left-0 z-40 flex-col glass border-r-0 transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <SidebarBody siteName={siteName} collapsed={collapsed} isAdmin={isAdmin} integrationLinks={integrationLinks} isActive={isActive} onNavigate={() => setMobileOpen(false)} />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full bg-surface border border-border text-text-tertiary hover:text-text-primary hover:border-purple/40 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </aside>
    </>
  );
}
