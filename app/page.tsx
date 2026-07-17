import { auth } from "@/lib/auth";
import { getSiteConfig } from "@/lib/site-config";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingHero from "@/components/landing/LandingHero";
import LandingFeatures from "@/components/landing/LandingFeatures";
import LandingProfiles from "@/components/landing/LandingProfiles";
import LandingHowItWorks from "@/components/landing/LandingHowItWorks";
import LandingDiscord from "@/components/landing/LandingDiscord";
import LandingPricing from "@/components/landing/LandingPricing";
import LandingAksaIdShowcase from "@/components/landing/LandingAksaIdShowcase";
import LandingFooter from "@/components/landing/LandingFooter";

export default async function HomePage() {
  const [session, config] = await Promise.all([auth(), getSiteConfig()]);

  return (
    <main className="bg-grain relative overflow-x-hidden">
      <LandingNavbar user={session?.user ?? null} siteName={config.siteName} />
      <LandingHero />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingProfiles />
      <LandingDiscord />
      <LandingPricing />
      {config.showAksaIdShowcase && (
        <LandingAksaIdShowcase
          discordUrl={config.aksaIdDiscordUrl}
          description={config.aksaIdDescription}
        />
      )}
      <LandingFooter config={config} />
    </main>
  );
}
