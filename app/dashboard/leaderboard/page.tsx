import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { Trophy, Eye } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";

export default async function LeaderboardPage() {
  await verifySession();

  const users = await prisma.user.findMany({
    where: {
      accountStatus: "ACTIVE",
      profileVisibility: "PUBLIC",
      username: { not: null },
      profileViews: { gt: 0 },
    },
    orderBy: { profileViews: "desc" },
    take: 25,
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
      profileViews: true,
    },
  });

  const [first, second, third] = [users[0], users[1], users[2]];
  const rest = users.slice(3);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <div className="mx-auto h-11 w-11 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
          <Trophy size={20} />
        </div>
        <h1 className="font-display font-semibold text-xl text-text-primary">
          Most Viewed Members
        </h1>
        <p className="text-sm text-text-tertiary">
          Peringkat berdasarkan jumlah kunjungan profil.
        </p>
      </div>

      {users.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-sm text-text-secondary">Belum ada data kunjungan profil.</p>
        </div>
      ) : (
        <>
          {/* Podium */}
          <div className="glass rounded-2xl p-8">
            <div className="flex items-end justify-center gap-6 sm:gap-10">
              {second && <PodiumSpot user={second} rank={2} size="md" />}
              {first && <PodiumSpot user={first} rank={1} size="lg" />}
              {third && <PodiumSpot user={third} rank={3} size="md" />}
            </div>
          </div>

          {/* Rest of the list */}
          {rest.length > 0 && (
            <div className="glass rounded-2xl divide-y divide-border/50 overflow-hidden">
              {rest.map((user, i) => (
                <div key={user.id} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="w-5 text-sm font-medium text-text-tertiary tabular-nums">
                    {i + 4}
                  </span>
                  <UserAvatar name={user.name} src={user.image} sizeClassName="h-9 w-9" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {user.name ?? user.username}
                    </p>
                    <p className="text-xs text-text-tertiary truncate">@{user.username}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-text-tertiary flex-shrink-0">
                    <Eye size={12} />
                    <span className="tabular-nums">{user.profileViews.toLocaleString("id-ID")}</span>
                  </div>
                  <Link
                    href={`/${user.username}`}
                    target="_blank"
                    className="flex-shrink-0 text-xs rounded-lg border border-border px-3 py-1.5 text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                  >
                    Visit
                  </Link>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PodiumSpot({
  user,
  rank,
  size,
}: {
  user: { id: string; username: string | null; name: string | null; image: string | null; profileViews: number };
  rank: 1 | 2 | 3;
  size: "md" | "lg";
}) {
  const ringClass =
    rank === 1
      ? "border-amber-400/60"
      : rank === 2
        ? "border-slate-300/50"
        : "border-orange-700/50";
  const badgeClass =
    rank === 1
      ? "bg-amber-400 text-black"
      : rank === 2
        ? "bg-slate-300 text-black"
        : "bg-orange-700 text-white";
  const avatarSizeClass = size === "lg" ? "h-[76px] w-[76px]" : "h-[60px] w-[60px]";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <div className={`rounded-full border-2 ${ringClass} p-1`}>
          <UserAvatar name={user.name} src={user.image} sizeClassName={avatarSizeClass} />
        </div>
        <span
          className={`absolute -bottom-1 left-1/2 -translate-x-1/2 h-5 w-5 rounded-full text-[11px] font-bold flex items-center justify-center ${badgeClass}`}
        >
          {rank}
        </span>
      </div>
      <p className="text-sm font-medium text-text-primary mt-1">
        {user.name ?? user.username}
      </p>
      <p className="text-xs text-text-tertiary">
        {user.profileViews.toLocaleString("id-ID")} views
      </p>
      <Link
        href={`/${user.username}`}
        target="_blank"
        className="text-[11px] rounded-lg border border-border px-2.5 py-1 text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
      >
        Visit
      </Link>
    </div>
  );
}
