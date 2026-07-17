import Link from "next/link";
import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { Activity } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { LOG_CATEGORIES, ACTION_CATEGORY, type LogCategory } from "@/lib/audit-categories";
import type { AuditAction } from "@prisma/client";

function actionsForCategory(category: LogCategory): AuditAction[] {
  return (Object.keys(ACTION_CATEGORY) as AuditAction[]).filter(
    (action) => ACTION_CATEGORY[action] === category
  );
}

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  await verifyAdmin();
  const { category: rawCategory } = await searchParams;
  const activeCategory = LOG_CATEGORIES.some((c) => c.key === rawCategory)
    ? (rawCategory as LogCategory)
    : null;

  // "developer" has no AuditAction mapped to it yet (see lib/audit-categories.ts) —
  // querying with an empty `in` filter would return everything, which is wrong,
  // so short-circuit to an empty result set instead.
  const actionFilter = activeCategory ? actionsForCategory(activeCategory) : null;
  const logs =
    actionFilter && actionFilter.length === 0
      ? []
      : await prisma.auditLog.findMany({
          where: actionFilter ? { action: { in: actionFilter } } : undefined,
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            id: true,
            action: true,
            entityType: true,
            entityId: true,
            metadata: true,
            createdAt: true,
            actor: { select: { name: true, email: true, image: true } },
          },
        });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-green-400/10 border border-green-400/20 flex items-center justify-center text-green-400">
          <Activity size={18} />
        </div>
        <div>
          <h1 className="font-display font-semibold text-xl text-text-primary">
            Activity Log
          </h1>
          <p className="text-sm text-text-secondary">
            Rekam jejak semua aktivitas di sistem — hanya bisa diakses admin.
          </p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Link
          href="/dashboard/admin/logs"
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            !activeCategory ? "bg-purple text-white" : "text-text-secondary hover:bg-white/5"
          }`}
        >
          Semua
        </Link>
        {LOG_CATEGORIES.map((c) => (
          <Link
            key={c.key}
            href={`/dashboard/admin/logs?category=${c.key}`}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeCategory === c.key ? "bg-purple text-white" : "text-text-secondary hover:bg-white/5"
            }`}
          >
            {c.label}
          </Link>
        ))}
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {logs.length === 0 ? (
          activeCategory === "developer" ? (
            <EmptyState
              icon={Activity}
              title="Belum ada event Developer"
              description="Kategori ini untuk event API/webhook/integrasi eksternal — belum ada sumber log yang menulis ke sini di project ini."
              variant="compact"
              className="py-16"
            />
          ) : (
            <EmptyState
              icon={Activity}
              title="Belum ada aktivitas tercatat"
              description="Log akan otomatis tercatat saat ada perubahan data."
              variant="compact"
              className="py-16"
            />
          )
        ) : (
          <div className="divide-y divide-border/50">
            {logs.map((log) => {
              const cat = LOG_CATEGORIES.find((c) => c.key === ACTION_CATEGORY[log.action]);
              return (
                <div
                  key={log.id}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-white/2 transition-colors"
                >
                  <div className="shrink-0 mt-0.5">
                    {log.actor?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={log.actor.image}
                        alt={log.actor.name ?? "Avatar"}
                        className="h-8 w-8 rounded-full border border-border"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-purple/20 flex items-center justify-center text-purple text-xs font-bold border border-purple/20">
                        {log.actor?.name?.[0]?.toUpperCase() ?? "S"}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-text-primary">
                        {log.actor?.name ?? log.actor?.email ?? "System"}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase ${
                          cat?.colorClass ?? "bg-white/5 text-text-tertiary border-border"
                        }`}
                      >
                        {log.action}
                      </span>
                      {cat && (
                        <span className="text-[9px] text-text-tertiary uppercase tracking-wide">
                          {cat.label}
                        </span>
                      )}
                      <span className="text-xs text-text-secondary">
                        {log.entityType}
                        {log.entityId && (
                          <span className="font-mono text-text-tertiary ml-1">
                            #{log.entityId.slice(0, 8)}
                          </span>
                        )}
                      </span>
                    </div>
                    {log.metadata && (
                      <pre className="text-[10px] text-text-tertiary font-mono mt-1 bg-white/3 rounded p-2 overflow-x-auto">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] text-text-tertiary">
                      {new Date(log.createdAt).toLocaleString("id-ID", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
