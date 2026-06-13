import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PracticeClient } from "@/components/exam/practice-client";
import { parseSections } from "@/lib/exam/paper-sections";

export default async function PlacementTakePage({
  params,
  searchParams,
}: {
  params: Promise<{ paperId: string }>;
  searchParams: Promise<{ attemptId?: string }>;
}) {
  const { paperId } = await params;
  const { attemptId } = await searchParams;

  if (!attemptId) {
    redirect("/placement");
  }

  const session = await auth();

  const paper = await db.examPaper.findFirst({
    where: { id: paperId, paperKind: "PLACEMENT", published: true },
    include: {
      questions: {
        include: { question: true },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!paper) notFound();

  const attempt = await db.attempt.findUnique({
    where: { id: attemptId, paperId },
  });

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
