import os from "node:os";
import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { LANYARD_BASE } from "@/lib/lanyard";
import {
  Activity,
  Database,
  Mail,
  Image as ImageIcon,
  MessageSquare,
  KeyRound,
  Cpu,
  MemoryStick,
  HardDrive,
  Timer,
  Server,
  Layers,
} from "lucide-react";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Status = "operational" | "degraded" | "down" | "not_configured" | "not_applicable";

interface StatusCard {
  key: string;
  label: string;
  icon: React.ElementType;
  status: Status;
  detail: string;
  latencyMs?: number;
}

const STATUS_META: Record<Status, { label: string; className: string }> = {
  operational: { label: "Operational", className: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  degraded: { label: "Degraded", className: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  down: { label: "Down", className: "text-red-400 bg-red-400/10 border-red-400/20" },
  not_configured: { label: "Belum Dikonfigurasi", className: "text-text-tertiary bg-white/5 border-border" },
  not_applicable: { label: "Tidak Dipakai", className: "text-text-tertiary bg-white/5 border-border" },
};

async function checkDatabase(): Promise<StatusCard> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - start;
    return {
      key: "database",
      label: "Database (PostgreSQL)",
      icon: Database,
      status: latencyMs > 500 ? "degraded" : "operational",
      detail: `Query SELECT 1 berhasil dalam ${latencyMs}ms`,
      latencyMs,
    };
  } catch (error) {
    return {
      key: "database",
      label: "Database (PostgreSQL)",
      icon: Database,
      status: "down",
      detail: error instanceof Error ? error.message : "Gagal terhubung ke database.",
    };
  }
}

async function checkLanyard(): Promise<StatusCard> {
  const start = Date.now();
  try {
    const res = await fetch(`${LANYARD_BASE.replace(/\/v1$/, "")}/v1/users/1`, {
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    const latencyMs = Date.now() - start;
    // Any HTTP response (even 404 for that dummy user id) means the
    // service itself is reachable — that's all "up" means here.
    return {
      key: "discord",
      label: "Discord Presence (Lanyard)",
      icon: MessageSquare,
      status: res.status < 500 ? "operational" : "degraded",
      detail: `${LANYARD_BASE} merespons (HTTP ${res.status}) dalam ${latencyMs}ms`,
      latencyMs,
    };
  } catch {
    return {
      key: "discord",
      label: "Discord Presence (Lanyard)",
      icon: MessageSquare,
      status: "down",
      detail: `Tidak bisa menjangkau ${LANYARD_BASE}.`,
    };
  }
}

function checkEmail(): StatusCard {
  const configured = Boolean(process.env.RESEND_API_KEY);
  return {
    key: "email",
    label: "Email (Resend)",
    icon: Mail,
    status: configured ? "operational" : "not_configured",
    detail: configured
      ? "RESEND_API_KEY terpasang — email transaksional dikirim via Resend."
      : "RESEND_API_KEY kosong — email sementara hanya dicetak ke console server (lihat lib/mail.ts).",
  };
}

function checkStorage(): StatusCard {
  const configured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
  return {
    key: "storage",
    label: "Storage (Cloudinary)",
    icon: ImageIcon,
    status: configured ? "operational" : "not_configured",
    detail: configured
      ? "Kredensial Cloudinary lengkap — upload avatar/banner/gallery aktif."
      : "Kredensial Cloudinary belum lengkap di environment variables.",
  };
}

function checkOAuth(): StatusCard {
  const github = Boolean(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET);
  const discord = Boolean(process.env.AUTH_DISCORD_ID && process.env.AUTH_DISCORD_SECRET);
  const both = github && discord;
  const none = !github && !discord;
  return {
    key: "oauth",
    label: "OAuth Login (GitHub + Discord)",
    icon: KeyRound,
    status: both ? "operational" : none ? "not_configured" : "degraded",
    detail: `GitHub: ${github ? "terkonfigurasi" : "kosong"} · Discord: ${discord ? "terkonfigurasi" : "kosong"}`,
  };
}

function checkProcess(): StatusCard[] {
  const load = os.loadavg();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedPct = Math.round(((totalMem - freeMem) / totalMem) * 100);
  const mem = process.memoryUsage();

  return [
    {
      key: "cpu",
      label: "CPU (load average host)",
      icon: Cpu,
      status: load[0] > os.cpus().length * 2 ? "degraded" : "operational",
      detail: `1m: ${load[0].toFixed(2)} · 5m: ${load[1].toFixed(2)} · 15m: ${load[2].toFixed(2)} (${os.cpus().length} core)`,
    },
    {
      key: "ram",
      label: "RAM (host)",
      icon: MemoryStick,
      status: usedPct > 90 ? "degraded" : "operational",
      detail: `${usedPct}% terpakai · proses Node ini: ${(mem.rss / 1024 / 1024).toFixed(0)}MB RSS`,
    },
  ];
}

function notApplicable(key: string, label: string, icon: React.ElementType, reason: string): StatusCard {
  return { key, label, icon, status: "not_applicable", detail: reason };
}

export default async function StatusPage() {
  await verifyAdmin();

  const [database, discord, ...processCards] = await Promise.all([
    checkDatabase(),
    checkLanyard(),
    ...checkProcess().map((c) => Promise.resolve(c)),
  ]);

  const cards: StatusCard[] = [
    {
      key: "website",
      label: "Website (Next.js)",
      icon: Server,
      status: "operational",
      detail: "Halaman ini berhasil dirender oleh server — request/response berjalan normal.",
    },
    database,
    checkEmail(),
    checkStorage(),
    discord,
    checkOAuth(),
    ...processCards,
    notApplicable(
      "disk",
      "Disk",
      HardDrive,
      "Butuh akses filesystem tambahan (mis. package `check-disk-space`) yang belum terpasang di project ini — tidak ditampilkan supaya tidak memberi angka palsu."
    ),
    notApplicable(
      "queue",
      "Queue / Workers",
      Layers,
      "Project ini tidak memakai job queue atau background worker (tidak ada BullMQ/Redis di stack) — semua proses berjalan sinkron dalam request Next.js."
    ),
    notApplicable(
      "redis",
      "Redis",
      Database,
      "Tidak dipakai — caching/rate-limit di project ini berjalan in-memory/DB, bukan Redis."
    ),
    notApplicable(
      "github_api",
      "GitHub API",
      Activity,
      "Tidak ada integrasi GitHub API langsung di project ini (GitHub hanya dipakai sebagai provider OAuth login, lihat kartu OAuth)."
    ),
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
          <Timer size={18} />
        </div>
        <div>
          <h1 className="font-display font-semibold text-xl text-text-primary">
            Status Sistem
          </h1>
          <p className="text-sm text-text-secondary">
            Pemeriksaan langsung terhadap komponen yang benar-benar dipakai project ini.
            Uptime proses: {formatUptime(process.uptime())}.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cards.map((card) => {
          const meta = STATUS_META[card.status];
          const Icon = card.icon;
          return (
            <div key={card.key} className="glass rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon size={15} className="text-text-tertiary flex-shrink-0" />
                  <p className="text-sm font-medium text-text-primary truncate">{card.label}</p>
                </div>
                <span
                  className={`flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full border ${meta.className}`}
                >
                  {meta.label}
                </span>
              </div>
              <p className="text-xs text-text-tertiary leading-relaxed">{card.detail}</p>
              {typeof card.latencyMs === "number" && (
                <p className="text-[10px] text-text-tertiary tabular-nums">{card.latencyMs}ms</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts = [];
  if (d) parts.push(`${d}h`);
  if (h) parts.push(`${h}j`);
  parts.push(`${m}m`);
  return parts.join(" ");
}
