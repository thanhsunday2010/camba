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
