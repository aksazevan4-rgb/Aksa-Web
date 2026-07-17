import { prisma } from "@/lib/prisma";
import HeroView from "@/components/HeroView";

export default async function Hero() {
  const [profile, ecosystemNodes] = await Promise.all([
    prisma.profile.findUnique({ where: { id: "profile" } }),
    prisma.ecosystemNode.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true, status: true },
    }),
  ]);

  return (
    <HeroView
      founderOf={profile?.founderOf ?? null}
      name={profile?.name ?? ""}
      roles={profile?.roles ?? []}
      ecosystemNodes={ecosystemNodes.map((n: typeof ecosystemNodes[number]) => ({
        id: n.id,
        name: n.name,
        status: n.status.toLowerCase() as "active" | "building" | "planned",
      }))}
    />
  );
}
