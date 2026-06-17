import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAchievementByKey } from "@/lib/gamification/definitions";
import type { YleLeaderboardEntry } from "@/lib/yle/leaderboard";

interface YleLeaderboardProps {
  entries: YleLeaderboardEntry[];
  levelLabel: string;
  currentUserId?: string;
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

export function YleLeaderboard({ entries, levelLabel, currentUserId }: YleLeaderboardProps) {
  return (
    <Card className="border-violet-200 bg-gradient-to-br from-violet-50/50 to-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-extrabold text-violet-900">
          🏆 Bảng xếp hạng · {levelLabel}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Điểm vũ trụ = luyện tập + mock + % hoàn thành ngân hàng đề
        </p>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có ai luyện level này — hãy là người đầu tiên!</p>
        ) : (
          <ol className="space-y-2">
            {entries.map((u) => {
              const isMe = currentUserId === u.userId;
              return (
                <li
                  key={u.userId}
                  className={`flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm ${
                    isMe ? "bg-violet-100 font-semibold ring-1 ring-violet-300" : ""
                  }`}
                >
                  <span className="min-w-0 truncate">
                    <span className="mr-1">{u.rank <= 3 ? ["🥇", "🥈", "🥉"][u.rank - 1] : `${u.rank}.`}</span>
                    {u.name ?? "Học sinh"}
                    {isMe && <span className="ml-1 text-xs text-violet-600">(bạn)</span>}
                    <span className="ml-1 text-muted-foreground">
                      {u.level.emoji}
                    </span>
                    <TitleBadge activeTitle={u.activeTitle} />
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="font-bold text-violet-700">{u.ylePoints}</span>
                    <span className="block text-[10px] text-muted-foreground">
                      {u.mockCount} mock · {u.completionPct}%
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
