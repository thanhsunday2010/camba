import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getGamificationProfile } from "@/lib/gamification/service";
import { isYleLevel } from "@/lib/yle/constants";
import { loadYleLevelHub } from "@/lib/yle/hub-data";
import type { YleLevel } from "@/lib/yle/constants";
import { HomeUniversePage } from "@/components/home/home-universe-page";

export const revalidate = 300;

export default async function HomePage() {
  const session = await auth();

  if (!session?.user?.id) {
    return <HomeUniversePage />;
  }

  const userId = session.user.id;

  const [user, gamification] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { name: true, targetExam: true, streak: true },
    }),
    getGamificationProfile(userId),
  ]);

  let continueMission: {
    href: string;
    label: string;
    emoji: string;
    reason: string;
    stepIndex?: number;
    totalSteps?: number;
  } | null = null;

  if (user && isYleLevel(user.targetExam)) {
    const hub = await loadYleLevelHub(user.targetExam as YleLevel);
    if (hub?.continueSuggestion) {
      const s = hub.continueSuggestion;
      continueMission = {
        href: s.href,
        label: s.label,
        emoji: s.emoji,
        reason: s.reason,
        stepIndex: s.stepIndex,
        totalSteps: s.totalSteps,
      };
    }
  }

  return (
    <HomeUniversePage
      isLoggedIn
      userName={user?.name}
      targetExam={user?.targetExam}
      streak={user?.streak ?? 0}
      xp={gamification.xp}
      levelEmoji={gamification.level.emoji}
      levelName={gamification.level.name}
      continueMission={continueMission}
    />
  );
}
