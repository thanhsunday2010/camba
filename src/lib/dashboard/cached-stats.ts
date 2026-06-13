import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

export const getCachedLeaderboard = unstable_cache(
  async () =>
    db.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { streak: "desc" },
      take: 5,
      select: { name: true, streak: true },
    }),
  ["dashboard-leaderboard"],
  { revalidate: 120 }
);
