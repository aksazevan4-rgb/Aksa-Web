"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Ban,
  CheckCircle2,
  Crown,
  Loader2,
  Pencil,
  Search,
  Shield,
  ShieldOff,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { PlanBadge } from "@/components/PlanBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { AdminEditUserModal } from "./AdminEditUserModal";
import { setUserPlan, setUserRole, setUserStatus, deleteUser } from "./actions";

type UserStatus = "ACTIVE" | "SUSPENDED" | "BANNED";
type UserRole = "ADMIN" | "USER";
type UserPlan = "FREE" | "PREMIUM";

type UserData = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: UserRole;
  plan: UserPlan;
  isFounder: boolean;
  username: string | null;
  bio: string | null;
  accountStatus: UserStatus;
  createdAt: Date;
  lastLoginAt: Date | null;
  accounts: { provider: string }[];
};

const STATUS_STYLES: Record<UserStatus, string> = {
  ACTIVE: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  SUSPENDED: "bg-amber-400/10 text-amber-300 border-amber-400/20",
  BANNED: "bg-red-400/10 text-red-300 border-red-400/20",
};

interface BadgeOption {
  id: string;
  name: string;
  category: string;
}

export default function AdminUsersClient({
  users,
  badges = [],
}: {
  users: UserData[];
  badges?: BadgeOption[];
}) {
  const [search, setSearch] = useState("");
  const [localUsers, setLocalUsers] = useState(users);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = localUsers.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = useMemo(
    () => [
      {
        label: "Total User",
        value: localUsers.length,
        icon: Users,
        color: "text-blue",
        bg: "bg-blue/10 border-blue/20",
      },
      {
        label: "Admin",
        value: localUsers.filter((u) => u.role === "ADMIN").length,
        icon: Shield,
        color: "text-purple",
        bg: "bg-purple/10 border-purple/20",
      },
      {
        label: "Premium",
        value: localUsers.filter((u) => u.plan === "PREMIUM").length,
        icon: Crown,
        color: "text-amber-300",
        bg: "bg-amber-400/10 border-amber-400/20",
      },
      {
        label: "Banned",
        value: localUsers.filter((u) => u.accountStatus === "BANNED").length,
        icon: Ban,
        color: "text-red-400",
        bg: "bg-red-400/10 border-red-400/20",
      },
    ],
    [localUsers]
  );

  function updateUser(id: string, patch: Partial<UserData>) {
    setLocalUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }

  function handlePlan(userId: string, currentPlan: UserPlan) {
    const newPlan = currentPlan === "PREMIUM" ? "FREE" : "PREMIUM";
    setLoadingId(userId);
    startTransition(async () => {
      const res = await setUserPlan(userId, newPlan);
      if (!res?.error) updateUser(userId, { plan: newPlan });
      setLoadingId(null);
    });
  }

  function handleRole(userId: string, currentRole: UserRole) {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    setLoadingId(userId);
    startTransition(async () => {
      const res = await setUserRole(userId, newRole);
      if (!res?.error) updateUser(userId, { role: newRole });
      setLoadingId(null);
    });
  }

  function handleStatus(userId: string, currentStatus: UserStatus) {
    const newStatus: UserStatus = currentStatus === "ACTIVE" ? "BANNED" : "ACTIVE";
    setLoadingId(userId);
    startTransition(async () => {
      const res = await setUserStatus(userId, newStatus);
      if (!res?.error) updateUser(userId, { accountStatus: newStatus });
      setLoadingId(null);
    });
  }

  function handleDelete(userId: string) {
    setLoadingId(userId);
    startTransition(async () => {
      const res = await deleteUser(userId);
      if (!res?.error) setLocalUsers((prev) => prev.filter((u) => u.id !== userId));
      setConfirmDelete(null);
      setLoadingId(null);
    });
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="glass rounded-2xl p-5">
            <div className={`h-9 w-9 rounded-xl border flex items-center justify-center mb-3 ${bg} ${color}`}>
              <Icon size={17} />
            </div>
            <p className="text-2xl font-display font-bold text-text-primary tabular-nums">
              {value.toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Header + search */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 glass rounded-xl px-3 py-2.5 flex-1 max-w-xs">
          <Search size={15} className="text-text-tertiary flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, email, username..."
            className="bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none w-full"
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X size={13} className="text-text-tertiary" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
          <Users size={13} />
          {filtered.length} dari {localUsers.length} user
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-border">
          {["User", "Role", "Plan", "Status", "Aksi"].map((h) => (
            <p key={h} className="text-[10px] font-semibold tracking-widest uppercase text-text-tertiary">
              {h}
            </p>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Tidak ada user yang cocok"
            description="Coba ubah kata kunci pencarian atau filter yang dipakai."
            variant="compact"
          />
        ) : (
          <div className="divide-y divide-border/50">
            {filtered.map((u) => {
              const isLoading = loadingId === u.id;
              return (
                <div
                  key={u.id}
                  className="grid sm:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center"
                >
                  {/* User info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar
                      src={u.image}
                      name={u.name}
                      email={u.email}
                      sizeClassName="h-9 w-9"
                      textClassName="text-sm"
                      className="flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {u.name ?? u.email}
                        </p>
                        {u.isFounder && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/20">
                            Founder
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-tertiary truncate">
                        {u.username ? `@${u.username}` : u.email}
                      </p>
                      <p className="text-[10px] text-text-tertiary sm:hidden">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString("id-ID")
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-full border ${
                        u.role === "ADMIN"
                          ? "bg-purple/10 text-purple border-purple/25"
                          : "bg-white/5 text-text-tertiary border-border"
                      }`}
                    >
                      {u.role === "ADMIN" ? <Shield size={10} /> : <User size={10} />}
                      {u.role}
                    </span>
                  </div>

                  {/* Plan */}
                  <div>
                    <PlanBadge user={u} size="sm" />
                  </div>

                  {/* Status */}
                  <div>
                    <span
                      className={`inline-block text-[10px] font-mono px-2 py-1 rounded-full border ${
                        STATUS_STYLES[u.accountStatus]
                      }`}
                    >
                      {u.accountStatus}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {isLoading ? (
                      <Loader2 size={15} className="animate-spin text-text-tertiary" />
                    ) : (
                      <>
                        {/* Edit name/username */}
                        <ActionBtn
                          onClick={() => setEditingUser(u)}
                          title="Edit profil"
                          icon={<Pencil size={13} />}
                          disabled={u.isFounder}
                        />

                        {/* Toggle Premium */}
                        <ActionBtn
                          onClick={() => handlePlan(u.id, u.plan)}
                          title={u.plan === "PREMIUM" ? "Cabut Premium" : "Grant Premium"}
                          icon={<Crown size={13} />}
                          active={u.plan === "PREMIUM"}
                          activeClass="text-amber-300 bg-amber-400/10 border-amber-400/25"
                          disabled={u.isFounder}
                        />

                        {/* Toggle Role */}
                        <ActionBtn
                          onClick={() => handleRole(u.id, u.role)}
                          title={u.role === "ADMIN" ? "Jadikan User" : "Jadikan Admin"}
                          icon={u.role === "ADMIN" ? <ShieldOff size={13} /> : <Shield size={13} />}
                          active={u.role === "ADMIN"}
                          activeClass="text-purple bg-purple/10 border-purple/25"
                          disabled={u.isFounder}
                        />

                        {/* Ban / Unban */}
                        <ActionBtn
                          onClick={() => handleStatus(u.id, u.accountStatus)}
                          title={u.accountStatus === "BANNED" ? "Unban" : "Ban"}
                          icon={u.accountStatus === "BANNED" ? <CheckCircle2 size={13} /> : <Ban size={13} />}
                          active={u.accountStatus === "BANNED"}
                          activeClass="text-red-400 bg-red-400/10 border-red-400/25"
                          disabled={u.isFounder}
                        />

                        {/* Delete */}
                        {!u.isFounder && (
                          <ActionBtn
                            onClick={() => setConfirmDelete(u.id)}
                            title="Hapus user"
                            icon={<Trash2 size={13} />}
                            danger
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editingUser && (
        <AdminEditUserModal
          user={editingUser}
          badges={badges}
          onClose={() => setEditingUser(null)}
          onSaved={(updated) => {
            updateUser(updated.id, {
              name: updated.name,
              username: updated.username,
              bio: updated.bio,
            });
            setEditingUser(null);
          }}
        />
      )}

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h2 className="font-display font-semibold text-lg text-text-primary">
              Hapus User?
            </h2>
            <p className="text-sm text-text-secondary">
              Tindakan ini permanen. Semua data user termasuk profil, link, dan media
              akan dihapus dan tidak bisa dipulihkan.
            </p>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-xl glass px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={pending}
                className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {pending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({
  onClick,
  title,
  icon,
  active,
  activeClass,
  danger,
  disabled,
}: {
  onClick: () => void;
  title: string;
  icon: React.ReactNode;
  active?: boolean;
  activeClass?: string;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`h-7 w-7 rounded-lg border flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        active && activeClass
          ? activeClass
          : danger
          ? "text-text-tertiary border-border hover:text-red-400 hover:bg-red-400/5 hover:border-red-400/20"
          : "text-text-tertiary border-border hover:text-text-primary hover:bg-white/5"
      }`}
    >
      {icon}
    </button>
  );
}
