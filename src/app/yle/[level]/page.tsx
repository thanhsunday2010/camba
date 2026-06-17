import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isYleLevel } from "@/lib/yle/constants";
import { loadYleLevelHub } from "@/lib/yle/hub-data";
import { YleOrbitHub } from "@/components/yle/yle-orbit-hub";
import { YleLeaderboard } from "@/components/yle/yle-leaderboard";
import { YleMascotRankPanel } from "@/components/yle/yle-mascot-rank-panel";
import { formatQuotaRatio } from "@/lib/subscription/plans";
import { auth } from "@/auth";

export const revalidate = 60;

export default async function YleLevelHubPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { level } = await params;
  if (!isYleLevel(level)) notFound();

  const hub = await loadYleLevelHub(level);
  if (!hub) redirect("/login");

  const { theme, progress, leaderboard, nodes, usage, userId, levelLabel } = hub;

  return (
    <div className="page-shell">
      <Link
        href="/yle"
        className="mb-4 inline-flex text-sm font-bold text-purple-600 hover:underline"
      >
        ← Vũ trụ YLE
      </Link>

      <YleOrbitHub
        level={level}
        levelLabel={levelLabel}
        planetEmoji={theme.emoji}
        themeBorder={theme.border}
        themeBg={theme.bg}
        nodes={nodes}
        mascotRank={progress.mascotRank}
      />

      <div className="mb-5 mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 rounded-xl border border-violet-100 bg-violet-50/40 px-3 py-2.5 text-xs sm:gap-x-6 sm:px-4 sm:py-3 sm:text-sm">
        <span>
          <span className="font-bold text-violet-900">Luyện:</span>{" "}
          {formatQuotaRatio(usage.practiceCount, usage.practiceLimit)}
        </span>
        <span>
          <span className="font-bold text-violet-900">Mock:</span>{" "}
          {formatQuotaRatio(usage.mockSkillCount, usage.mockTestLimit)}
        </span>
        <span>
          <span className="font-bold text-violet-900">Điểm vũ trụ:</span>{" "}
          <span className="font-bold text-violet-700">{progress.stats.ylePoints}</span>
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <YleMascotRankPanel mascotRank={progress.mascotRank} stats={progress.stats} />
        <YleLeaderboard
          entries={leaderboard}
          levelLabel={levelLabel}
          currentUserId={userId}
        />
      </div>
    </div>
  );
}
