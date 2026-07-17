import { verifyAdmin } from "@/lib/dal";
import { templateModerationService } from "@/features/marketplace/server/service";
import { ModerationClient } from "./ModerationClient";

export default async function ModerationPage() {
  await verifyAdmin();
  const pending = await templateModerationService.listPending();

  return (
    <ModerationClient
      items={pending.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        category: t.category,
        price: t.price,
        updatedAt: t.updatedAt.toISOString(),
        authorUsername: t.author?.username ?? null,
        authorName: t.author?.name ?? null,
      }))}
    />
  );
}
