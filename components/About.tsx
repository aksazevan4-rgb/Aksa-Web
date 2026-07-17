import { prisma } from "@/lib/prisma";
import AboutView from "@/components/AboutView";

export default async function About() {
  const profile = await prisma.profile.findUnique({
    where: { id: "profile" },
    include: { avatarMedia: { select: { url: true } } },
  });

  return (
    <AboutView
      name={profile?.name ?? ""}
      bioParagraphs={profile?.bioParagraphs ?? []}
      location={profile?.location ?? ""}
      timezone={profile?.timezone ?? ""}
      status={profile?.status ?? ""}
      avatarUrl={profile?.avatarMedia?.url ?? null}
    />
  );
}
