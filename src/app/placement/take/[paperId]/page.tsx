import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth-session";
import { db } from "@/lib/db";
import { getCachedPlacementPaper } from "@/lib/exam/cached-practice";
import { PracticeClient } from "@/components/exam/practice-client";
import { parseSections } from "@/lib/exam/paper-sections";

export const revalidate = 300;

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

  const questions = paper.questions.map((pq) => ({
    id: pq.question.id,
    type: pq.question.type,
    content: pq.question.content,
    audioUrl: pq.question.audioUrl,
    points: pq.question.points,
    skill: pq.question.skill,
    title: pq.question.title,
  }));

  const sections = parseSections(paper.sections);

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
    />
  );
}
