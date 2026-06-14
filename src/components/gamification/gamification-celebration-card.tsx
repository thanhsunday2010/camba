import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { GamificationSnapshot } from "@/lib/gamification/types";
import { xpProgressInLevel } from "@/lib/gamification/definitions";

interface GamificationCelebrationCardProps {
  snapshot: GamificationSnapshot;
}

export function GamificationCelebrationCard({ snapshot }: GamificationCelebrationCardProps) {
  const progress = xpProgressInLevel(snapshot.totalXp);

  return (
    <Card className="mb-6 border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-white to-purple-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-wrap items-center gap-2 text-lg font-extrabold">
          🎉 Thành tích mới
          <Badge className="bg-emerald-600">+{snapshot.xpEarned} XP</Badge>
          {snapshot.levelUp && (
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-500">
              Thăng hạng!
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-3xl">{snapshot.level.emoji}</span>
          <div>
            <p className="font-extrabold text-purple-900">
              Cấp {snapshot.level.level} · {snapshot.level.name}
            </p>
            <p className="text-sm text-muted-foreground">{snapshot.totalXp} XP tổng</p>
          </div>
        </div>

        {progress.next && (
          <div>
            <div className="mb-1 flex justify-between text-xs font-semibold text-muted-foreground">
              <span>Tiến độ lên cấp {progress.next.level}</span>
              <span>
                {progress.xpIntoLevel}/{progress.xpNeededForNext} XP
              </span>
            </div>
            <Progress value={progress.progressPct} className="h-2" />
          </div>
        )}

        {snapshot.unlockedAchievements.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {snapshot.unlockedAchievements.map((a) => (
              <Badge
                key={a.key}
                variant="outline"
                className="border-purple-200 bg-white px-3 py-1 text-sm"
                title={a.description}
              >
                {a.emoji} {a.title}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
