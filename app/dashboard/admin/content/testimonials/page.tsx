import Link from "next/link";
import { ArrowLeft, MessageSquareQuote } from "lucide-react";
import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { TestimonialsClient } from "./TestimonialsClient";

export default async function AdminTestimonialsPage() {
  await verifyAdmin();

  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/admin/content"
          className="h-9 w-9 flex items-center justify-center rounded-xl glass text-text-tertiary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="h-10 w-10 rounded-xl bg-purple/10 border border-purple/20 flex items-center justify-center text-purple">
          <MessageSquareQuote size={18} />
        </div>
        <div>
          <h1 className="font-display font-semibold text-xl text-text-primary">
            Kelola Testimonials
          </h1>
          <p className="text-sm text-text-secondary">
            Testimoni yang tampil di homepage
          </p>
        </div>
      </div>

      <TestimonialsClient
        testimonials={testimonials.map((t: (typeof testimonials)[number]) => ({
          id: t.id,
          name: t.name,
          role: t.role,
          content: t.content,
          avatarUrl: t.avatarUrl,
          order: t.order,
        }))}
      />
    </div>
  );
}
