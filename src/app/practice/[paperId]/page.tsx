import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PracticeClient } from "@/components/exam/practice-client";

export default async function PracticePage({
  params,
}: {
  params: Promise<{ paperId: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { paperId } = await params;

  const paper = await db.examPaper.findUnique({
    where: { id: paperId, published: true },
    include: {
      questions: {
        include: { question: true },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!paper) notFound();

  const questions = paper.questions.map((pq) => ({
    id: pq.question.id,
    type: pq.question.type,
    content: pq.question.content,
    audioUrl: pq.question.audioUrl,
    points: pq.question.points,
  }));

  return (
    <PracticeClient
      paperId={paper.id}
      paperTitle={paper.title}
      timeLimit={paper.timeLimit}
      isMockTest={paper.isMockTest}
      questions={questions}
    />
  );
}
