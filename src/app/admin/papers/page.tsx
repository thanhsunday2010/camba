import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AdminPapersClient } from "@/components/admin/papers-client";

export default async function AdminPapersPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const [papers, questions] = await Promise.all([
    db.examPaper.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        level: true,
        skill: true,
        paperKind: true,
        timeLimit: true,
        isMockTest: true,
        published: true,
        sections: true,
        questions: {
          select: {
            id: true,
            orderIndex: true,
            question: {
              select: {
                id: true,
                title: true,
                type: true,
                level: true,
                skill: true,
                points: true,
              },
            },
          },
          orderBy: { orderIndex: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.question.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
      select: { id: true, title: true, type: true, level: true, skill: true },
    }),
  ]);

  return <AdminPapersClient papers={papers} questions={questions} />;
}
