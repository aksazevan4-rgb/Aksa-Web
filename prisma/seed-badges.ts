import { PrismaClient } from "@prisma/client";
import { BADGE_CATALOG } from "../lib/badge-catalog";

const prisma = new PrismaClient();

async function main() {
  for (const badge of BADGE_CATALOG) {
    await prisma.badge.upsert({
      where: { key: badge.key },
      update: {
        label: badge.label,
        description: badge.description,
        icon: badge.icon,
        colorClass: badge.colorClass,
        actionType: badge.actionType,
        actionLabel: badge.actionLabel,
        actionHref: badge.actionHref,
        sortOrder: badge.sortOrder,
      },
      create: {
        key: badge.key,
        label: badge.label,
        description: badge.description,
        icon: badge.icon,
        colorClass: badge.colorClass,
        actionType: badge.actionType,
        actionLabel: badge.actionLabel,
        actionHref: badge.actionHref,
        sortOrder: badge.sortOrder,
      },
    });
  }

  console.log(`Badge seed selesai — ${BADGE_CATALOG.length} badge tersinkron.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
