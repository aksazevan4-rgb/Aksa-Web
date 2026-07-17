import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getUserFeatures } from "@/lib/premium-features";
import type { WidgetConfigMap } from "@/lib/widget-registry";
import { Palette } from "lucide-react";
import { AppearanceClient } from "./AppearanceClient";

export default async function AppearancePage() {
  const session = await verifySession();

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      plan: true,
      username: true,
      profileTheme: true,
      profileLayout: true,
      profileBackground: true,
      profileBorder: true,
      profileFont: true,
      widgetConfig: true,
      customCursorUrl: true,
      backgroundAudioUrl: true,
      profileEffects: true,
      image: true,
      bannerImage: true,
    },
  });

  if (!dbUser) return null;

  const accessibleFeatures = await getUserFeatures({
    plan: dbUser.plan,
    role: dbUser.role,
  });

  return (
    <main className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-purple/10 border border-purple/20 flex items-center justify-center text-purple">
          <Palette size={20} />
        </div>
        <div>
          <h1 className="font-display font-semibold text-xl text-text-primary">
            Tampilan Profil
          </h1>
          <p className="text-sm text-text-tertiary">
            Atur layout, background, border, dan widget yang muncul di profil publikmu.
          </p>
        </div>
      </div>

      <AppearanceClient
        username={dbUser.username}
        currentLayout={dbUser.profileLayout ?? "classic"}
        currentTheme={dbUser.profileTheme ?? "default"}
        currentBorder={dbUser.profileBorder ?? "none"}
        currentFont={dbUser.profileFont ?? "inter"}
        currentBackground={
          dbUser.profileBackground as { type: string; colors?: string[]; mediaUrl?: string } | null
        }
        widgetConfig={dbUser.widgetConfig as WidgetConfigMap | null}
        accessibleFeatures={accessibleFeatures}
        currentAvatarUrl={dbUser.image}
        currentBannerUrl={dbUser.bannerImage}
        currentCursorUrl={dbUser.customCursorUrl}
        currentAudioUrl={dbUser.backgroundAudioUrl}
        currentEffects={
          dbUser.profileEffects as {
            cardOpacity: number;
            cardBlur: number;
            glowUsername: boolean;
            glowSocials: boolean;
            glowBadges: boolean;
          } | null
        }
      />
    </main>
  );
}
