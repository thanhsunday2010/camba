import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { getLevelForXp } from "@/lib/gamification/definitions";

export const getCachedLeaderboard = unstable_cache(
  async () =>
    db.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { streak: "desc" },
      take: 5,
      select: { name: true, streak: true },
    }),
  ["dashboard-leaderboard-streak"],
  { revalidate: 120 }
);

export const getCachedXpLeaderboard = unstable_cache(
  async () => {
    const users = await db.user.findMany({
      where: { role: "STUDENT" },
      orderBy: [{ xp: "desc" }, { streak: "desc" }],
      take: 5,
      select: { name: true, xp: true, streak: true, activeTitle: true },
    });
    return users.map((u) => ({
      name: u.name,
      xp: u.xp,
      streak: u.streak,
      level: getLevelForXp(u.xp),
      activeTitle: u.activeTitle,
    }));
  },
  ["dashboard-leaderboard-xp"],
  { revalidate: 120 }
);
