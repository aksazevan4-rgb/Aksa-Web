import { Crown, ShieldCheck, Sparkles, User } from "lucide-react";
import { getPlanLabel, type PlanLabelUser } from "@/lib/premium";

const STYLES: Record<
  ReturnType<typeof getPlanLabel>,
  { className: string; Icon: typeof Crown }
> = {
  Founder: {
    className: "bg-gradient-to-r from-purple/30 to-blue/30 text-purple border-purple/40",
    Icon: Crown,
  },
  Admin: {
    className: "bg-blue/15 text-blue border-blue/30",
    Icon: ShieldCheck,
  },
  Premium: {
    className: "bg-gradient-to-r from-amber-500/20 to-purple/20 text-amber-300 border-amber-400/30",
    Icon: Sparkles,
  },
  User: {
    className: "bg-white/5 text-text-tertiary border-border",
    Icon: User,
  },
};

interface PlanBadgeProps {
  user: PlanLabelUser;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Badge peran/plan dipakai konsisten di Navbar, dashboard, admin panel,
 * dan profil publik. Urutan & gaya warna sengaja dibedakan supaya sekilas
 * pandang langsung kebaca: Founder (ungu-biru gradient) > Admin (biru) >
 * Premium (emas) > User (netral).
 */
export function PlanBadge({ user, size = "sm", className = "" }: PlanBadgeProps) {
  const label = getPlanLabel(user);
  const { className: colorClass, Icon } = STYLES[label];
  const sizeClass =
    size === "sm" ? "text-[10px] px-2 py-0.5 gap-1" : "text-xs px-2.5 py-1 gap-1.5";

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium uppercase tracking-wide ${colorClass} ${sizeClass} ${className}`}
    >
      <Icon size={size === "sm" ? 10 : 12} />
      {label}
    </span>
  );
}
