import { redirect } from "next/navigation";import { auth } from "@/auth";
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <CambaMascot size="lg" mood="wave" />
        <div>
          <ExamsHubHeading />
          <ExamsHubIntro levelLabel={formatExamLevel(user.targetExam)} />
        </div>
      </div>

      <LevelPicker currentLevel={user.targetExam} variant="full" />

      <ExamsHubIeltsSection
        speakingTitle={academicMeta.hubTitle("Speaking")}
        speakingDescription={`${academicMeta.description} · 1 câu ngẫu nhiên/Part · AI chấm band ngay · mock full Part 1+2+3`}
        writingTitle={academicMeta.hubTitle("Writing")}
        writingDescription="Task 1 Academic (biểu đồ/bản đồ/sơ đồ) + Task 2 Essay · 1 câu ngẫu nhiên/Task · AI chấm band ngay · mock Task 1 + Task 2"
        generalDescription={generalMeta.description}
      />
    </div>
  );
}
