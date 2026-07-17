import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FileText, MessageSquare, CheckCircle, Clock } from "lucide-react";
import { MessageActions } from "./MessageActions";

export default async function AdminContentPage() {
  await verifyAdmin();

  const [messages, profile] = await Promise.all([
    prisma.message.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        body: true,
        read: true,
        createdAt: true,
      },
    }),
    prisma.profile.findUnique({ where: { id: "profile" } }),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-purple/10 border border-purple/20 flex items-center justify-center text-purple">
          <FileText size={18} />
        </div>
        <div>
          <h1 className="font-display font-semibold text-xl text-text-primary">
            Konten Website
          </h1>
          <p className="text-sm text-text-secondary">
            Kelola profil, pesan, dan konten website
          </p>
        </div>
      </div>

      {/* Profile info */}
      {profile && (
        <div className="glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3">
            Profil Utama
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Nama", value: profile.name },
              { label: "Role", value: profile.role },
              { label: "Lokasi", value: profile.location },
              { label: "Timezone", value: profile.timezone },
              { label: "Status", value: profile.status },
              { label: "Founder Of", value: profile.founderOf ?? "—" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/3 rounded-xl p-3 border border-border">
                <p className="text-[10px] text-text-tertiary uppercase tracking-wide mb-1">
                  {label}
                </p>
                <p className="text-sm text-text-primary font-medium truncate">
                  {value}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-tertiary mt-3 p-3 bg-white/3 rounded-xl border border-border">
            💡 Edit profil langsung melalui database (Prisma Studio:{" "}
            <code className="font-mono text-purple">npm run db:studio</code>)
            atau melalui form edit yang akan hadir segera.
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <MessageSquare size={16} className="text-purple" />
          <h2 className="text-sm font-semibold text-text-primary">
            Pesan Masuk ({messages.length})
          </h2>
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare size={32} className="text-text-tertiary mx-auto mb-3" />
            <p className="text-text-secondary text-sm">Belum ada pesan</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {messages.map((msg: typeof messages[number]) => (
              <div
                key={msg.id}
                className="flex items-start gap-3 px-5 py-3.5 hover:bg-white/2 transition-colors"
              >
                <div className="mt-0.5">
                  {msg.read ? (
                    <CheckCircle size={13} className="text-blue" />
                  ) : (
                    <Clock size={13} className="text-yellow-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-text-primary">
                      {msg.name}
                    </p>
                    <p className="text-xs text-text-tertiary">{msg.email}</p>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5 truncate">
                    {msg.subject}
                  </p>
                  <MessageActions
                    messageId={msg.id}
                    read={msg.read}
                    email={msg.email}
                    subject={msg.subject}
                  />
                </div>
                <div className="shrink-0 text-right">
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase ${
                      !msg.read
                        ? "bg-yellow-400/10 text-yellow-400 border-yellow-400/20"
                        : "bg-white/5 text-text-tertiary border-border"
                    }`}
                  >
                    {msg.read ? "READ" : "UNREAD"}
                  </span>
                  <p className="text-[10px] text-text-tertiary mt-1">
                    {new Date(msg.createdAt).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CMS sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "Edit Profil About Me", href: "/dashboard/admin/content/about" },
          { label: "Kelola Projects", href: "/dashboard/admin/content/projects" },
          { label: "Kelola Ecosystem Nodes", href: "/dashboard/admin/content/ecosystem" },
          { label: "Kelola Tech Stack", href: "/dashboard/admin/content/techstack" },
          { label: "Kelola Testimonials", href: "/dashboard/admin/content/testimonials" },
          { label: "Kelola Services", href: "/dashboard/admin/content/services" },
          { label: "Pengaturan SEO", href: "/dashboard/admin/content/seo" },
          { label: "Media Manager", href: "/dashboard/admin/content/media" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-between p-4 glass rounded-xl hover:border-purple/30 transition-colors group"
          >
            <p className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
              {item.label}
            </p>
            <span className="text-text-tertiary group-hover:text-purple transition-colors">
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
