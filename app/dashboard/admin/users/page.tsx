import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { Users } from "lucide-react";
import AdminUsersClient from "./AdminUsersClient";

export default async function AdminUsersPage() {
  await verifyAdmin();

  const [users, badges] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        plan: true,
        isFounder: true,
        username: true,
        bio: true,
        accountStatus: true,
        createdAt: true,
        lastLoginAt: true,
        accounts: {
          select: { provider: true },
        },
      },
    }),
    // docs/14-admin-panel.md §3 — daftar badge untuk form Grant Badge di modal
    prisma.badge.findMany({
      select: { id: true, name: true, category: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <main className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-purple/10 border border-purple/20 flex items-center justify-center text-purple">
          <Users size={20} />
        </div>
        <div>
          <h1 className="font-display font-semibold text-xl text-text-primary">
            Kelola User
          </h1>
          <p className="text-sm text-text-tertiary">
            Cari, kelola role/plan, dan moderasi akun user di platform.
          </p>
        </div>
      </div>

      <AdminUsersClient users={users} badges={badges} />
    </main>
  );
}
