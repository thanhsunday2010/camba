import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { formatExamLevel, formatSkill, SKILLS } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CambaMascot } from "@/components/kids/camba-mascot";
import { LevelPicker } from "@/components/exam/level-picker";
import { Flame, Target, TrendingUp, ClipboardList, CalendarClock } from "lucide-react";
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
      assignments: {
        where: { completed: false },
        include: {
          paper: true,
          teacher: { select: { name: true } },
        },
        orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
        take: 10,
      },
    },
  });

  if (!user) redirect("/login");

  const totalAttempts = await db.attempt.count({
    where: {
      userId: user.id,
      status: { in: ["GRADED", "SUBMITTED"] },
    },
  });

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

  const recentScores = await db.attempt.findMany({
    where: { userId: user.id, status: "GRADED", score: { not: null }, maxScore: { not: null } },
    include: { paper: true },
    orderBy: { submittedAt: "desc" },
    take: 5,
  });

  const leaderboard = await db.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { streak: "desc" },
    take: 5,
    select: { name: true, streak: true },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex animate-bounce-in items-center gap-4">
        <CambaMascot size="lg" mood="wave" />
        <div>
        <h1 className="text-3xl font-extrabold kid-gradient-text">
          Xin chào, {user.name}! 👋
        </h1>
        <p className="font-semibold text-muted-foreground">
          Mục tiêu: {formatExamLevel(user.targetExam)} 🎯
          {user.grade && ` · ${user.grade}`}
        </p>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 font-bold">
              <Flame className="h-5 w-5 text-orange-500" />
              Streak
            </CardDescription>
            <CardTitle className="text-4xl font-extrabold text-orange-600">
              {user.streak} 🔥
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 font-bold">
              <Target className="h-5 w-5 text-purple-500" />
              Bài đã làm
            </CardDescription>
            <CardTitle className="text-4xl font-extrabold text-purple-600">{totalAttempts}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 font-bold">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Cấp độ
            </CardDescription>
            <CardTitle className="text-4xl font-extrabold text-emerald-600">{user.targetExam}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {user.assignments.length > 0 && (
        <Card className="mb-8 border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-extrabold">
              <ClipboardList className="h-5 w-5 text-purple-600" />
              📋 Bài được giao ({user.assignments.length})
            </CardTitle>
            <CardDescription>Giáo viên đã giao — hoàn thành để đánh dấu xong</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.assignments.map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-3"
              >
                <div>
                  <p className="font-medium">{a.paper.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {a.teacher.name ?? "Giáo viên"} · {formatSkill(a.paper.skill)}
                    {a.dueDate && (
                      <span className="ml-2 inline-flex items-center gap-1">
                        <CalendarClock className="h-3 w-3" />
                        Hạn: {a.dueDate.toLocaleDateString("vi-VN")}
                      </span>
                    )}
                  </p>
                </div>
                <Button asChild size="sm" variant="fun" className="rounded-full">
                  <Link href={`/practice/${a.paperId}`}>Làm bài 🚀</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
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

          {recentScores.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Điểm gần đây</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentScores.map((a) => {
                  const pct =
                    a.score !== null && a.maxScore
                      ? Math.round((a.score / a.maxScore) * 100)
                      : 0;
                  return (
                    <div key={a.id} className="flex items-center justify-between text-sm">
                      <span className="truncate pr-4">{a.paper.title}</span>
                      <Badge variant={pct >= 60 ? "success" : "danger"}>{pct}%</Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

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
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader>
              <CardTitle className="font-extrabold">🐰 Đổi level luyện tập</CardTitle>
              <CardDescription>
                Chọn level bất kỳ — không cần đăng ký tài khoản mới
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LevelPicker currentLevel={user.targetExam} variant="compact" />
              <Button asChild className="mt-3 w-full" variant="outline" size="sm">
                <Link href="/exams">Xem tất cả level →</Link>
              </Button>
            </CardContent>
          </Card>

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

          <Button asChild className="w-full kid-btn-fun" size="lg">
            <Link href="/exams">🚀 Chọn level & luyện tập</Link>
          </Button>
          <Button asChild className="w-full" size="lg" variant="outline">
            <Link href="/placement">🎯 Test trình độ</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
