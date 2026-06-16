import { db } from "@/lib/db";
import { requireAdminPage } from "@/lib/admin/access";
import {
  getMcqContentFields,
  getQuestionImageHint,
  getQuestionImageStatus,
  summarizeImageAudit,
} from "@/lib/exam/question-image-needs";
import { QuestionImagesClient } from "@/components/admin/question-images-client";

export default async function AdminQuestionImagesPage() {
  const { access } = await requireAdminPage("questions.manage");

  const questions = await db.question.findMany({
    select: {
      id: true,
      type: true,
      level: true,
      skill: true,
      title: true,
      content: true,
    },
    orderBy: [{ level: "asc" }, { skill: "asc" }, { createdAt: "asc" }],
  });

  const auditItems = questions
    .map((q) => {
      const imageStatus = getQuestionImageStatus(q.type, q.content);
      if (imageStatus === "not_needed") return null;

      const fields = getMcqContentFields(q.content);
      return {
        id: q.id,
        type: q.type,
        level: q.level,
        skill: q.skill,
        title: q.title,
        imageStatus,
        imageHint: getQuestionImageHint(q.type, q.content),
        imageUrl: fields?.imageUrl ?? null,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const summary = summarizeImageAudit(questions);

  return (
    <QuestionImagesClient
      items={auditItems}
      summary={{
        needsImage: summary.needsImage,
        missing: summary.missing,
        complete: summary.complete,
      }}
      permissions={access.permissions}
    />
  );
}
