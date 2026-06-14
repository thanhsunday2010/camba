import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAchievementByKey } from "@/lib/gamification/definitions";
import type { LeaderboardEntry } from "@/lib/gamification/types";

interface GamificationLeaderboardProps {
  xpLeaderboard: LeaderboardEntry[];
  streakLeaderboard: { name: string | null; streak: number }[];
}

function TitleBadge({ activeTitle }: { activeTitle: string | null }) {
  if (!activeTitle) return null;
  const def = getAchievementByKey(activeTitle);
  if (!def) return null;
  return (
    <Badge variant="outline" className="ml-1 text-[10px]">
      {def.emoji}
    </Badge>
  );
}

export function GamificationLeaderboard({
  xpLeaderboard,
  streakLeaderboard,
}: GamificationLeaderboardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border-purple-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-extrabold">🏆 Xếp hạng XP</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {xpLeaderboard.map((u, i) => (
              <li key={i} className="flex items-center justify-between gap-2 text-sm">
                <span className="min-w-0 truncate">
                  {i + 1}. {u.name ?? "Học sinh"}{" "}
                  <span className="text-muted-foreground">
                    {u.level.emoji} C{u.level.level}
                  </span>
                  <TitleBadge activeTitle={u.activeTitle} />
                </span>
                <span className="shrink-0 font-bold text-purple-700">{u.xp ?? 0} XP</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="border-orange-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-extrabold">🔥 Xếp hạng Streak</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {streakLeaderboard.map((u, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="truncate">
                  {i + 1}. {u.name ?? "Học sinh"}
                </span>
                <span className="font-medium">{u.streak} 🔥</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
