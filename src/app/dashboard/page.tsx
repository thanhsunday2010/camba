import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { formatExamLevel, formatSkill, SKILLS } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Flame, Target, TrendingUp } from "lucide-react";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      attempts: {
        where: { status: { in: ["GRADED", "SUBMITTED"] } },
        include: { paper: true },
        orderBy: { submittedAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user) redirect("/login");

  const skillStats = await db.attempt.findMany({
    where: { userId: user.id, status: "GRADED", score: { not: null } },
    include: { paper: true },
  });

  const bySkill: Record<string, { total: number; count: number }> = {};
  for (const s of SKILLS) bySkill[s.value] = { total: 0, count: 0 };
  for (const a of skillStats) {
    const skill = a.paper.skill;
    if (a.score !== null && a.maxScore) {
      bySkill[skill].total += (a.score / a.maxScore) * 100;
      bySkill[skill].count += 1;
    }
  }

  const leaderboard = await db.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { streak: "desc" },
    take: 5,
    select: { name: true, streak: true },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Xin chào, {user.name}!</h1>
        <p className="text-muted-foreground">
          Mục tiêu: {formatExamLevel(user.targetExam)}
          {user.grade && ` · ${user.grade}`}
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              Streak
            </CardDescription>
            <CardTitle className="text-3xl">{user.streak} ngày</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Target className="h-4 w-4 text-cambridge-500" />
              Bài đã làm
            </CardDescription>
            <CardTitle className="text-3xl">{user.attempts.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Cấp độ
            </CardDescription>
            <CardTitle className="text-3xl">{user.targetExam}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tiến độ theo kỹ năng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {SKILLS.map((skill) => {
                const stat = bySkill[skill.value];
                const avg = stat.count > 0 ? Math.round(stat.total / stat.count) : 0;
                return (
                  <div key={skill.value}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{skill.label}</span>
                      <span>{stat.count > 0 ? `${avg}%` : "Chưa có dữ liệu"}</span>
                    </div>
                    <Progress value={avg} />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bài làm gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              {user.attempts.length === 0 ? (
                <p className="text-muted-foreground">Chưa có bài làm nào.</p>
              ) : (
                <div className="space-y-3">
                  {user.attempts.map((a) => (
                    <Link
                      key={a.id}
                      href={`/results/${a.id}`}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-slate-50"
                    >
                      <div>
                        <p className="font-medium">{a.paper.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatSkill(a.paper.skill)} · {formatExamLevel(a.paper.level)}
                        </p>
                      </div>
                      <div className="text-right">
                        {a.score !== null && a.maxScore ? (
                          <Badge variant={a.score / a.maxScore >= 0.6 ? "success" : "danger"}>
                            {Math.round((a.score / a.maxScore) * 100)}%
                          </Badge>
                        ) : (
                          <Badge variant="outline">Đang chấm</Badge>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bảng xếp hạng Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {leaderboard.map((u, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span>
                      {i + 1}. {u.name ?? "Học sinh"}
                    </span>
                    <span className="font-medium">{u.streak} 🔥</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Button asChild className="w-full" size="lg">
            <Link href={`/exams/${user.targetExam}`}>Bắt đầu luyện tập</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
