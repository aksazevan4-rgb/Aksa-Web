import { prisma } from "@/lib/prisma";
import TechStackView from "@/components/TechStackView";

export default async function TechStack() {
  const items = await prisma.techItem.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <TechStackView
      items={items.map((t: (typeof items)[number]) => ({
        id: t.id,
        name: t.name,
        category: t.category,
      }))}
    />
  );
}
