import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AdminQuestionsClient } from "@/components/admin/questions-client";

export default async function AdminQuestionsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const questions = await db.question.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      level: true,
      skill: true,
      title: true,
      points: true,
      content: true,
      correctAnswer: true,
      audioUrl: true,
    },
  });

  return <AdminQuestionsClient questions={questions} />;
}
