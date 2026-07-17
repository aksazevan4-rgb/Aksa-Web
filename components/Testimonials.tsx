import { prisma } from "@/lib/prisma";
import TestimonialsView from "@/components/TestimonialsView";

export default async function Testimonials() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  if (testimonials.length === 0) return null;

  return (
    <TestimonialsView
      testimonials={testimonials.map((t: (typeof testimonials)[number]) => ({
        id: t.id,
        name: t.name,
        role: t.role,
        content: t.content,
        avatarUrl: t.avatarUrl,
      }))}
    />
  );
}
