import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { OnboardingClient } from "./OnboardingClient";

export default async function OnboardingPage() {
  const session = await verifySession();

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, onboardingCompleted: true },
  });

  // Already onboarded (or somehow reached this route directly a second
  // time) — don't show the picker again, just go to the dashboard.
  if (dbUser?.onboardingCompleted) {
    redirect("/dashboard");
  }

  return (
    <OnboardingClient displayName={dbUser?.name ?? dbUser?.email ?? "there"} />
  );
}
