import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getUserFeatures } from "@/lib/premium-features";
import { resolveActiveWidgets, type WidgetConfigMap } from "@/lib/widget-registry";
import { Blocks } from "lucide-react";
import { WidgetConfigEditor, type StoredWidgetConfig } from "./WidgetConfigEditor";
import { GuestbookModeration } from "./GuestbookModeration";

export default async function WidgetConfigPage() {
  const session = await verifySession();

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      plan: true,
      widgetConfig: true,
    },
  });

  const accessibleFeatures = await getUserFeatures({
    plan: dbUser?.plan ?? "FREE",
    role: dbUser?.role ?? "USER",
  });

  const activeWidgets = resolveActiveWidgets(
    dbUser?.widgetConfig as WidgetConfigMap | null,
    accessibleFeatures
  );
  const guestbookActive = activeWidgets.some((w) => w.key === "guestbook");

  const guestbookEntries = guestbookActive
    ? await prisma.guestbookEntry.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { id: true, name: true, message: true, createdAt: true },
      })
    : [];

  return (
    <main className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-purple/10 border border-purple/20 flex items-center justify-center text-purple">
          <Blocks size={20} />
        </div>
        <div>
          <h1 className="font-display font-semibold text-xl text-text-primary">
            Konten Widget
          </h1>
          <p className="text-sm text-text-tertiary">
            Isi konten untuk widget yang sudah aktif di profilmu.
          </p>
        </div>
      </div>

      <WidgetConfigEditor
        widgetConfig={dbUser?.widgetConfig as StoredWidgetConfig | null}
        accessibleFeatures={accessibleFeatures}
      />

      {guestbookActive && (
        <GuestbookModeration
          entries={guestbookEntries.map((e) => ({
            id: e.id,
            name: e.name,
            message: e.message,
            createdAt: e.createdAt.toISOString(),
          }))}
        />
      )}
    </main>
  );
}
