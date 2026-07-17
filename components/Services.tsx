import { prisma } from "@/lib/prisma";
import ServicesView from "@/components/ServicesView";

export default async function Services() {
  const services = await prisma.service.findMany({
    orderBy: { order: "asc" },
  });

  if (services.length === 0) return null;

  return (
    <ServicesView
      services={services.map((s: (typeof services)[number]) => ({
        id: s.id,
        title: s.title,
        description: s.description,
      }))}
    />
  );
}
