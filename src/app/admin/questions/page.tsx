import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AdminQuestionsClient } from "@/components/admin/questions-client";

export default async function AdminQuestionsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const questions = await db.question.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return <AdminQuestionsClient questions={questions} />;
}
