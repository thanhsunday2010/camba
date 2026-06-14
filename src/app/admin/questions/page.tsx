import { db } from "@/lib/db";
import { AdminQuestionsClient } from "@/components/admin/questions-client";
import { requireAdminPage } from "@/lib/admin/access";

export default async function AdminQuestionsPage() {
  const { access } = await requireAdminPage("questions.manage");

  const questions = await db.question.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      level: true,
      skill: true,
      title: true,
      points: true,
    },
  });

  return <AdminQuestionsClient questions={questions} permissions={access.permissions} />;
}
