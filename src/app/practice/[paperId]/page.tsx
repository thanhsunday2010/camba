import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth-session";
import { getCachedPracticePaper } from "@/lib/exam/cached-practice";
import { PracticeClient } from "@/components/exam/practice-client";
import { parseSections } from "@/lib/exam/paper-sections";

export const revalidate = 300;

export default async function PracticePage({
  params,
}: {
  params: Promise<{ paperId: string }>;
}) {
  const [{ paperId }, session] = await Promise.all([params, getSession()]);
  if (!session) redirect("/login");

  const paper = await getCachedPracticePaper(paperId);
  if (!paper) notFound();

  const instantFeedback = paper.paperKind === "PRACTICE" && !paper.isMockTest;

  const questions = paper.questions.map((pq) => ({
    id: pq.question.id,
    type: pq.question.type,
    content: pq.question.content,
    audioUrl: pq.question.audioUrl,
    points: pq.question.points,
    skill: pq.question.skill,
    title: pq.question.title,
    ...(instantFeedback ? { correctAnswer: pq.question.correctAnswer } : {}),
  }));

  const sections = parseSections(paper.sections);
  const isSequential =
    paper.isMockTest ||
    paper.paperKind === "MOCK_FULL" ||
    paper.paperKind === "PLACEMENT";

  return (
    <PracticeClient
      paperId={paper.id}
      paperTitle={paper.title}
      timeLimit={paper.timeLimit}
      isMockTest={isSequential}
      paperKind={paper.paperKind}
      sections={sections}
      questions={questions}
      instantFeedback={instantFeedback}
    />
  );
}
