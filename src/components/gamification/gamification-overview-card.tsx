import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { GamificationProfile } from "@/lib/gamification/types";
import { ACHIEVEMENTS } from "@/lib/gamification/definitions";

interface GamificationOverviewCardProps {
  profile: GamificationProfile;
  achievements: { key: string; title: string; emoji: string; description: string }[];
}

export function GamificationOverviewCard({ profile, achievements }: GamificationOverviewCardProps) {
  return (
    <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50/80 to-purple-50/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-wrap items-center justify-between gap-2 font-extrabold">
          <span>
            {profile.level.emoji} Cấp {profile.level.level} · {profile.level.name}
          </span>
          {profile.titleDisplay && (
            <Badge variant="outline" className="font-semibold">
              {profile.titleDisplay.emoji} {profile.titleDisplay.title}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {profile.xp} XP · {profile.completedLessons} bài hoàn thành ·{" "}
          {profile.unlockedCount}/{profile.totalAchievements} danh hiệu
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {profile.nextLevel ? (
          <div>
            <div className="mb-1 flex justify-between text-xs font-semibold">
              <span>Tiến độ lên {profile.nextLevel.emoji} {profile.nextLevel.name}</span>
              <span>
                {profile.xpIntoLevel}/{profile.xpNeededForNext} XP
              </span>
            </div>
            <Progress value={profile.progressPct} className="h-2" />
          </div>
        ) : (
          <p className="text-sm font-semibold text-purple-700">Bạn đã đạt cấp cao nhất! 👑</p>
        )}

        {achievements.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {achievements.slice(-6).map((a) => (
              <Badge key={a.key} variant="secondary" className="text-xs" title={a.description}>
                {a.emoji} {a.title}
              </Badge>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-center text-sm">
          <div className="rounded-xl border bg-white/80 p-2">
            <p className="text-xs text-muted-foreground">Streak</p>
            <p className="font-extrabold text-orange-600">{profile.streak} 🔥</p>
          </div>
          <div className="rounded-xl border bg-white/80 p-2">
            <p className="text-xs text-muted-foreground">Bài học</p>
            <p className="font-extrabold text-purple-700">{profile.completedLessons}</p>
          </div>
        </div>

        <details className="rounded-xl border bg-white/60 p-3 text-sm">
          <summary className="cursor-pointer font-bold text-purple-800">
            Tất cả danh hiệu ({profile.unlockedCount}/{profile.totalAchievements})
          </summary>
          <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto">
            {Object.values(ACHIEVEMENTS).map((def) => {
              const unlocked = achievements.some((a) => a.key === def.key);
              return (
                <li
                  key={def.key}
                  className={unlocked ? "text-purple-900" : "text-muted-foreground opacity-60"}
                >
                  {def.emoji} <strong>{def.title}</strong> — {def.description}
                  {!unlocked && " (chưa mở)"}
                </li>
              );
            })}
          </ul>
        </details>

        <Button asChild size="sm" variant="outline" className="w-full rounded-full">
          <Link href="/exams">Luyện thêm để lên cấp 🚀</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
