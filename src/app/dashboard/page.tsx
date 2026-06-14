import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UserRound } from "lucide-react";
import { getSession } from "@/lib/auth-session";
import { db } from "@/lib/db";
import { getCachedLeaderboard, getCachedXpLeaderboard } from "@/lib/dashboard/cached-stats";
import { GamificationOverviewCard } from "@/components/gamification/gamification-overview-card";
import { GamificationLeaderboard } from "@/components/gamification/gamification-leaderboard";
import {
  getGamificationProfile,
  getUserAchievements,
} from "@/lib/gamification/service";
import { formatExamLevel, formatSkill, SKILLS } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CambaMascot } from "@/components/kids/camba-mascot";
import { LevelPicker } from "@/components/exam/level-picker";
import { Flame, Target, TrendingUp, ClipboardList, CalendarClock } from "lucide-react";
import { SubscriptionUsageCard } from "@/components/pricing/subscription-usage-card";
import { ReferralShareCard } from "@/components/referral/referral-share-card";
import { ReferralWelcomeToast } from "@/components/referral/referral-welcome-toast";
import { ensureUserReferralCode } from "@/lib/referral/service";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import type { UserProfileData } from "@/lib/actions/profile";

export const revalidate = 60;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const defaultTab = params.tab === "profile" ? "profile" : "overview";

  const userId = session.user.id;

  const [user, totalAttempts, skillStats, recentScores, recentAttempts, assignments, streakLeaderboard, xpLeaderboard, referralCode, referralCount, gamificationProfile, userAchievements] =
    await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          phone: true,
          image: true,
          targetExam: true,
          grade: true,
          streak: true,
          dateOfBirth: true,
          passwordHash: true,
        },
      }),
      db.attempt.count({
        where: {
          userId,
          status: { in: ["GRADED", "SUBMITTED"] },
        },
      }),
      db.attempt.findMany({
        where: { userId, status: "GRADED", score: { not: null } },
        select: {
          score: true,
          maxScore: true,
          paper: { select: { skill: true } },
        },
        orderBy: { submittedAt: "desc" },
        take: 50,
      }),
      db.attempt.findMany({
        where: { userId, status: "GRADED", score: { not: null }, maxScore: { not: null } },
        select: {
          id: true,
          score: true,
          maxScore: true,
          paper: { select: { title: true } },
        },
        orderBy: { submittedAt: "desc" },
        take: 5,
      }),
      db.attempt.findMany({
        where: { userId, status: { in: ["GRADED", "SUBMITTED"] } },
        select: {
          id: true,
          score: true,
          maxScore: true,
          paper: { select: { title: true, skill: true, level: true } },
        },
        orderBy: { submittedAt: "desc" },
        take: 10,
      }),
      db.assignment.findMany({
        where: { studentId: userId, completed: false },
        select: {
          id: true,
          paperId: true,
          dueDate: true,
          paper: { select: { title: true, skill: true } },
          teacher: { select: { name: true } },
        },
        orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
        take: 10,
      }),
      getCachedLeaderboard(),
      getCachedXpLeaderboard(),
      ensureUserReferralCode(userId),
      db.user.count({ where: { referredById: userId } }),
      getGamificationProfile(userId),
      getUserAchievements(userId),
    ]);

  if (!user) redirect("/login");

  const profile: UserProfileData = {
    id: userId,
    name: user.name,
    email: user.email,
    phone: user.phone,
    image: user.image,
    grade: user.grade,
    targetExam: user.targetExam,
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().slice(0, 10) : null,
    hasPassword: Boolean(user.passwordHash),
  };

  const bySkill: Record<string, { total: number; count: number }> = {};
  for (const s of SKILLS) bySkill[s.value] = { total: 0, count: 0 };
  for (const a of skillStats) {
    const skill = a.paper.skill;
    if (a.score !== null && a.maxScore) {
      bySkill[skill].total += (a.score / a.maxScore) * 100;
      bySkill[skill].count += 1;
    }
  }

  const overview = (
    <>
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

      {assignments.length > 0 && (
        <Card className="mb-8 border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-extrabold">
              <ClipboardList className="h-5 w-5 text-purple-600" />
              📋 Bài được giao ({assignments.length})
            </CardTitle>
            <CardDescription>Giáo viên đã giao — hoàn thành để đánh dấu xong</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {assignments.map((a) => (
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
              {recentAttempts.length === 0 ? (
                <p className="text-muted-foreground">Chưa có bài làm nào.</p>
              ) : (
                <div className="space-y-3">
                  {recentAttempts.map((a) => (
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
          <GamificationOverviewCard profile={gamificationProfile} achievements={userAchievements} />
          <ReferralShareCard referralCode={referralCode} referralCount={referralCount} />
          <SubscriptionUsageCard userId={userId} />

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

          <GamificationLeaderboard
            xpLeaderboard={xpLeaderboard}
            streakLeaderboard={streakLeaderboard}
          />

          <Button asChild className="w-full kid-btn-fun" size="lg">
            <Link href="/exams">🚀 Chọn level & luyện tập</Link>
          </Button>
          <Button asChild className="w-full" size="lg" variant="outline">
            <Link href="/placement">🎯 Test trình độ</Link>
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <ReferralWelcomeToast />
      <div className="mb-8 flex animate-bounce-in items-center gap-4">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name ?? "Avatar"}
            width={72}
            height={72}
            unoptimized
            className="h-[72px] w-[72px] rounded-full border-4 border-purple-200 object-cover shadow-md"
          />
        ) : (
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-purple-200 bg-gradient-to-br from-purple-100 to-pink-100 shadow-md">
            <UserRound className="h-8 w-8 text-purple-500" />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-extrabold kid-gradient-text">
            Xin chào, {user.name}! 👋
          </h1>
          <p className="font-semibold text-muted-foreground">
            {gamificationProfile.level.emoji} Cấp {gamificationProfile.level.level} ·{" "}
            {gamificationProfile.level.name}
            {gamificationProfile.titleDisplay &&
              ` · ${gamificationProfile.titleDisplay.emoji} ${gamificationProfile.titleDisplay.title}`}
            {" · "}Mục tiêu: {formatExamLevel(user.targetExam)} 🎯
            {user.grade && ` · ${user.grade}`}
            {user.dateOfBirth && ` · ${new Date(user.dateOfBirth).toLocaleDateString("vi-VN")}`}
          </p>
        </div>
      </div>

      <DashboardTabs
        key={defaultTab}
        overview={overview}
        profile={profile}
        defaultTab={defaultTab}
      />
    </div>
  );
}
