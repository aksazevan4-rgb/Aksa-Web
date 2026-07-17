import { verifyAdmin } from "@/lib/dal";
import { featureFlagService } from "@/features/feature-flags/server/service";
import { FeatureFlagsClient } from "./FeatureFlagsClient";

export default async function FeatureFlagsPage() {
  await verifyAdmin();
  const flags = await featureFlagService.list();

  return (
    <FeatureFlagsClient
      flags={flags.map((f) => ({
        id: f.id,
        key: f.key,
        description: f.description,
        enabled: f.enabled,
        rolloutPercentage: f.rolloutPercentage,
      }))}
    />
  );
}
