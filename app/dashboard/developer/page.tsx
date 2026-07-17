import { verifySession } from "@/lib/dal";
import { apiKeyService } from "@/features/api-keys/server/service";
import { DeveloperClient } from "./DeveloperClient";

export default async function DeveloperPage() {
  const session = await verifySession();
  const keys = await apiKeyService.listForUser(session.user.id);

  return (
    <DeveloperClient
      keys={keys.map((k) => ({
        id: k.id,
        name: k.name,
        keyPrefix: k.keyPrefix,
        lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
        revokedAt: k.revokedAt?.toISOString() ?? null,
        createdAt: k.createdAt.toISOString(),
      }))}
    />
  );
}
