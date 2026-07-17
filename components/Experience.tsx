import { prisma } from "@/lib/prisma";
import ExperienceView from "@/components/ExperienceView";

export default async function Experience() {
  const entries = await prisma.experience.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <ExperienceView
      entries={entries.map((e: (typeof entries)[number]) => ({
        id: e.id,
        role: e.role,
        company: e.company,
        startDate: e.startDate,
        endDate: e.endDate,
        current: e.current,
        description: e.description,
      }))}
    />
  );
}
