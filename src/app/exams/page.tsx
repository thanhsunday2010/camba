import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { formatExamLevel } from "@/lib/constants";
import { LevelPicker } from "@/components/exam/level-picker";
import { CambaMascot } from "@/components/kids/camba-mascot";
import { IELTS_MODULE_META } from "@/lib/exam/ielts-module";
import { ExamsHubHeading, ExamsHubIntro } from "@/components/exam/exams-hub-editable";
import { ExamsHubIeltsSection } from "@/components/inline-edit/exams-hub-ielts-section";

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
    <div className="page-shell">
      <div className="page-hero">
        <CambaMascot size="lg" mood="wave" />
        <div>
          <ExamsHubHeading />
          <ExamsHubIntro levelLabel={formatExamLevel(user.targetExam)} />
        </div>
      </div>

      <Link
        href="/yle"
        className="mb-6 flex items-center gap-3 rounded-2xl border-2 border-violet-300 bg-gradient-to-r from-violet-100 to-pink-100 p-4 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
      >
        <span className="text-3xl">🌌</span>
        <div>
          <p className="font-extrabold text-violet-900">Vũ trụ YLE — Starters · Movers · Flyers</p>
          <p className="text-sm text-muted-foreground">Hub tròn quanh hành tinh, bảng xếp hạng & thăng hạng Camba</p>
        </div>
        <span className="ml-auto text-sm font-bold text-violet-700">Vào →</span>
      </Link>

      <LevelPicker currentLevel={user.targetExam} variant="full" />

      <ExamsHubIeltsSection
        speakingTitle={academicMeta.hubTitle("Speaking")}
        speakingDescription="Part 1–3 · AI chấm band ngay"
        writingTitle={academicMeta.hubTitle("Writing")}
        writingDescription="Task 1 + Task 2 · AI chấm band ngay"
        generalDescription={generalMeta.description}
      />
    </div>
  );
}
