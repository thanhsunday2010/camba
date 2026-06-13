import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AdminPapersClient } from "@/components/admin/papers-client";

export default async function AdminPapersPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const [papers, questions] = await Promise.all([
    db.examPaper.findMany({
      include: {
        questions: {
          include: { question: true },
          orderBy: { orderIndex: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.question.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ]);

  return <AdminPapersClient papers={papers} questions={questions} />;
}
