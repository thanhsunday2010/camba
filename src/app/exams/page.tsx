import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { formatExamLevel } from "@/lib/constants";
import { LevelPicker } from "@/components/exam/level-picker";
import { CambaMascot } from "@/components/kids/camba-mascot";
import { Card, CardContent } from "@/components/ui/card";
import { IeltsModuleBadge } from "@/components/ielts/ielts-module-badge";
import {
  IELTS_ACADEMIC_SPEAKING_URL,
  IELTS_ACADEMIC_WRITING_URL,
  IELTS_MODULE_META,
} from "@/lib/exam/ielts-module";

export default async function ExamsHubPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { targetExam: true },
  });
  if (!user) redirect("/login");

  const academicMeta = IELTS_MODULE_META.ACADEMIC;
  const generalMeta = IELTS_MODULE_META.GENERAL;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <CambaMascot size="lg" mood="wave" />
        <div>
          <h1 className="text-3xl font-extrabold kid-gradient-text">Chọn level luyện tập</h1>
          <p className="mt-1 max-w-xl font-semibold text-muted-foreground">
            Bạn có thể đổi level bất cứ lúc nào — không cần tạo tài khoản mới.
            Level mặc định hiện tại:{" "}
            <strong className="text-purple-700">{formatExamLevel(user.targetExam)}</strong>
          </p>
        </div>
      </div>

      <LevelPicker currentLevel={user.targetExam} variant="full" />

      <div className="mt-8 mb-2 flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-extrabold text-slate-800">IELTS — Luyện Speaking & Writing</h2>
        <IeltsModuleBadge module="ACADEMIC" />
      </div>

      <Card className="border-2 border-rose-200 bg-gradient-to-br from-rose-50/60 to-white">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-lg font-extrabold text-rose-800">
                🎤 {academicMeta.hubTitle("Speaking")}
              </p>
              <IeltsModuleBadge module="ACADEMIC" size="sm" />
            </div>
            <p className="mt-1 max-w-xl text-sm font-medium text-muted-foreground">
              {academicMeta.description} · 1 câu ngẫu nhiên/Part · AI chấm band ngay · mock full
              Part 1+2+3
            </p>
          </div>
          <Link
            href={IELTS_ACADEMIC_SPEAKING_URL}
            className="kid-btn-fun inline-flex rounded-full bg-rose-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-700"
          >
            Vào luyện Speaking Academic
          </Link>
        </CardContent>
      </Card>

      <Card className="mt-4 border-2 border-amber-200 bg-gradient-to-br from-amber-50/60 to-white">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-lg font-extrabold text-amber-900">
                ✏️ {academicMeta.hubTitle("Writing")}
              </p>
              <IeltsModuleBadge module="ACADEMIC" size="sm" />
            </div>
            <p className="mt-1 max-w-xl text-sm font-medium text-muted-foreground">
              Task 1 Academic (biểu đồ/bản đồ/sơ đồ) + Task 2 Essay · 1 câu ngẫu nhiên/Task · AI
              chấm band ngay · mock Task 1 + Task 2
            </p>
          </div>
          <Link
            href={IELTS_ACADEMIC_WRITING_URL}
            className="kid-btn-fun inline-flex rounded-full bg-amber-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-700"
          >
            Vào luyện Writing Academic
          </Link>
        </CardContent>
      </Card>

      <Card className="mt-4 border-2 border-dashed border-teal-200 bg-teal-50/40 opacity-90">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-extrabold text-teal-900">
                IELTS General Training — Speaking & Writing
              </p>
              <IeltsModuleBadge module="GENERAL" size="sm" />
            </div>
            <p className="mt-1 max-w-xl text-sm font-medium text-muted-foreground">
              {generalMeta.description}
            </p>
          </div>
          <span className="rounded-full bg-teal-100 px-4 py-2 text-sm font-bold text-teal-800">
            Sắp ra mắt
          </span>
        </CardContent>
      </Card>

      <p className="mt-8 text-center text-sm font-medium text-muted-foreground">
        Muốn biết trình độ?{" "}
        <Link href="/placement" className="font-bold text-purple-600 underline">
          Làm bài test trình độ
        </Link>
      </p>
    </div>
  );
}
