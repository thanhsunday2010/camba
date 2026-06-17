import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth-session";
import { getCachedPracticePaper } from "@/lib/exam/cached-practice";
import { PracticeClient } from "@/components/exam/practice-client";
import { PaperComments } from "@/components/exam/paper-comments";
import { getPaperComments } from "@/lib/actions/paper-comments";
import { parseSections } from "@/lib/exam/paper-sections";
import { getUserPlanLimits } from "@/lib/subscription/service";
import { isPartAiPracticePaper } from "@/lib/exam/ai-practice-config";
import { parseIeltsModuleFromPoolKey } from "@/lib/exam/ielts-module";

export const revalidate = 300;

export default async function PracticePage({
  params,
}: {
  params: Promise<{ paperId: string }>;
}) {
  const [{ paperId }, session] = await Promise.all([params, getSession()]);
  if (!session) redirect("/login");

  const [paper, planLimits, comments] = await Promise.all([
    getCachedPracticePaper(paperId),
    getUserPlanLimits(session.user.id),
    getPaperComments(paperId),
  ]);
  if (!paper) notFound();

  const dynamicPool = !!paper.practicePoolKey || !!paper.mockPoolKey;

  const questions = dynamicPool
    ? []
    : paper.questions.map((pq) => ({
        id: pq.question.id,
        type: pq.question.type,
        content: pq.question.content,
        audioUrl: pq.question.audioUrl,
        points: pq.question.points,
        skill: pq.question.skill,
        title: pq.question.title,
        correctAnswer: pq.question.correctAnswer,
      }));

  const sections = parseSections(paper.sections);
  const isSequential =
    paper.isMockTest ||
    paper.paperKind === "MOCK_FULL" ||
    paper.paperKind === "PLACEMENT";
  const ieltsModule = parseIeltsModuleFromPoolKey(
    paper.practicePoolKey ?? paper.mockPoolKey
  );

  return (
    <>
      <PracticeClient
      paperId={paper.id}
      paperTitle={paper.title}
      timeLimit={paper.timeLimit}
      isMockTest={isSequential}
      paperKind={paper.paperKind}
      sections={sections}
      questions={questions}
      dynamicPool={dynamicPool}
      maxSpeakingWords={planLimits.speakingWordLimit}
      practicePoolKey={paper.practicePoolKey}
      mockPoolKey={paper.mockPoolKey}
      partAiPractice={isPartAiPracticePaper(paper)}
      ieltsModule={ieltsModule ?? undefined}
    />
      <PaperComments
        paperId={paper.id}
        initialComments={comments}
        currentUserId={session.user.id}
        currentUserName={session.user.name}
      />
    </>
  );
}
