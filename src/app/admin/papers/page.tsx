import { db } from "@/lib/db";
import { AdminPapersClient } from "@/components/admin/papers-client";
import { requireAdminPage } from "@/lib/admin/access";

export default async function AdminPapersPage() {
  const { access } = await requireAdminPage("papers.manage");

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

  return (
    <AdminPapersClient papers={papers} questions={questions} permissions={access.permissions} />
  );
}
