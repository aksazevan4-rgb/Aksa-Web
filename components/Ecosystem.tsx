import { prisma } from "@/lib/prisma";
import EcosystemView from "@/components/EcosystemView";

export default async function Ecosystem() {
  const [profile, nodes] = await Promise.all([
    prisma.profile.findUnique({
      where: { id: "profile" },
      select: { name: true },
    }),
    prisma.ecosystemNode.findMany({
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <EcosystemView
      rootName={profile?.name ?? ""}
      nodes={nodes.map((n: (typeof nodes)[number]) => ({
        id: n.id,
        name: n.name,
        description: n.description,
        status: n.status.toLowerCase() as "active" | "building" | "planned",
        url: n.url,
      }))}
    />
  );
}
