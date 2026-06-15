import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth-session";
import { db } from "@/lib/db";
import { getCachedPlacementPaper } from "@/lib/exam/cached-practice";
import { PracticeClient } from "@/components/exam/practice-client";
import { parseSections } from "@/lib/exam/paper-sections";
import { assignPlacementQuestionsForAttempt } from "@/lib/placement/select-questions";
import { getUserPlanLimits } from "@/lib/subscription/service";
import { PLANS } from "@/lib/subscription/plans";

export const revalidate = 300;

const questionSelect = {
  id: true,
  type: true,
  content: true,
  audioUrl: true,
  points: true,
  skill: true,
  title: true,
} as const;

export default async function PlacementTakePage({
  params,
  searchParams,
}: {
  params: Promise<{ paperId: string }>;
  searchParams: Promise<{ attemptId?: string }>;
}) {
  const [{ paperId }, { attemptId }] = await Promise.all([params, searchParams]);

  if (!attemptId) {
    redirect("/placement");
  }

  const [session, paper, attempt] = await Promise.all([
    getSession(),
    getCachedPlacementPaper(paperId),
    db.attempt.findUnique({
      where: { id: attemptId, paperId },
      select: { id: true, userId: true, status: true },
    }),
  ]);

  if (!paper) notFound();

  if (!attempt || attempt.status !== "IN_PROGRESS") {
    redirect("/placement");
  }

  if (attempt.userId) {
    if (!session || session.user.id !== attempt.userId) {
      redirect("/placement");
    }
  }

  await assignPlacementQuestionsForAttempt(db, attemptId);

  const attemptQuestions = await db.attemptQuestion.findMany({
    where: { attemptId },
    orderBy: { orderIndex: "asc" },
    select: { question: { select: questionSelect } },
  });

  const questions = attemptQuestions.map((aq) => ({
    id: aq.question.id,
    type: aq.question.type,
    content: aq.question.content,
    audioUrl: aq.question.audioUrl,
    points: aq.question.points,
    skill: aq.question.skill,
    title: aq.question.title,
  }));

  const sections = parseSections(paper.sections);

  const planLimits =
    attempt.userId && session
      ? await getUserPlanLimits(session.user.id)
      : PLANS.FREE.limits;

  return (
    <PracticeClient
      paperId={paper.id}
      paperTitle={paper.title}
      timeLimit={paper.timeLimit}
      isMockTest
      paperKind="PLACEMENT"
      sections={sections}
      questions={questions}
      initialAttemptId={attemptId}
      isGuestAttempt={!attempt.userId}
      maxWritingWords={planLimits.writingWordLimit}
      maxSpeakingWords={planLimits.speakingWordLimit}
    />
  );
}
