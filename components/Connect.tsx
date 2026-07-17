import { prisma } from "@/lib/prisma";
import ConnectView, { ConnectLink } from "@/components/ConnectView";

export default async function Connect() {
  const settings = await prisma.settings.findUnique({
    where: { id: "settings" },
  });

  const candidates: { key: ConnectLink["key"]; label: string; url: string | null | undefined }[] = [
    { key: "website", label: "Website", url: settings?.socialWebsite },
    { key: "discord", label: "Discord Server", url: settings?.socialDiscord },
    { key: "aksaId", label: "AKSA.ID", url: settings?.aksaIdDiscordUrl },
    { key: "github", label: "GitHub", url: settings?.socialGithub },
    { key: "youtube", label: "YouTube", url: settings?.socialYoutube },
    { key: "tiktok", label: "TikTok", url: settings?.socialTiktok },
    { key: "instagram", label: "Instagram", url: settings?.socialInstagram },
    { key: "saweria", label: "Saweria", url: settings?.socialSaweria },
    { key: "bagibagi", label: "BagiBagi", url: settings?.socialBagibagi },
  ];

  const links: ConnectLink[] = candidates
    .filter((c): c is { key: ConnectLink["key"]; label: string; url: string } =>
      Boolean(c.url)
    )
    .map((c) => ({ key: c.key, label: c.label, url: c.url }));

  return <ConnectView links={links} />;
}
