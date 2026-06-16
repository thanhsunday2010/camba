"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { requireAdminPermission } from "@/lib/admin/access";
import { db } from "@/lib/db";
import { getMcqContentFields } from "@/lib/exam/question-image-needs";
import { uploadQuestionImageFile } from "@/lib/storage/question-image-upload";

function mergeImageIntoContent(
  content: unknown,
  imageUrl: string | null
): Prisma.InputJsonValue {
  const base =
    content && typeof content === "object" && !Array.isArray(content)
      ? { ...(content as Record<string, unknown>) }
      : {};

  if (imageUrl) {
    base.imageUrl = imageUrl;
  } else {
    delete base.imageUrl;
  }

  return base as Prisma.InputJsonValue;
}

export async function uploadQuestionImageAction(formData: FormData) {
  const { error: authError } = await requireAdminPermission("questions.manage");
  if (authError) return { error: authError };

  const questionId = (formData.get("questionId") as string | null)?.trim();
  const file = formData.get("image") as File | null;

  if (!questionId) return { error: "Thiếu ID câu hỏi" };
  if (!file?.size) return { error: "Chọn file ảnh" };

  const question = await db.question.findUnique({
    where: { id: questionId },
    select: { id: true, content: true },
  });
  if (!question) return { error: "Không tìm thấy câu hỏi" };

  try {
    const imageUrl = await uploadQuestionImageFile(questionId, file);
    const content = mergeImageIntoContent(question.content, imageUrl);

    await db.question.update({
      where: { id: questionId },
      data: { content },
    });

    revalidatePath("/admin/questions");
    revalidatePath("/admin/question-images");
    return { success: true as const, imageUrl };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload thất bại" };
  }
}

export async function removeQuestionImageAction(questionId: string) {
  const { error: authError } = await requireAdminPermission("questions.manage");
  if (authError) return { error: authError };

  const question = await db.question.findUnique({
    where: { id: questionId },
    select: { content: true },
  });
  if (!question) return { error: "Không tìm thấy câu hỏi" };

  const content = mergeImageIntoContent(question.content, null);
  await db.question.update({
    where: { id: questionId },
    data: { content },
  });

  revalidatePath("/admin/questions");
  revalidatePath("/admin/question-images");
  return { success: true as const };
}

export async function updateQuestionImageDescriptionAction(
  questionId: string,
  imageDescription: string
) {
  const { error: authError } = await requireAdminPermission("questions.manage");
  if (authError) return { error: authError };

  const question = await db.question.findUnique({
    where: { id: questionId },
    select: { content: true },
  });
  if (!question) return { error: "Không tìm thấy câu hỏi" };

  const fields = getMcqContentFields(question.content);
  const base =
    question.content && typeof question.content === "object" && !Array.isArray(question.content)
      ? { ...(question.content as Record<string, unknown>) }
      : {};

  const trimmed = imageDescription.trim();
  if (trimmed) base.imageDescription = trimmed;
  else delete base.imageDescription;

  await db.question.update({
    where: { id: questionId },
    data: { content: base as Prisma.InputJsonValue },
  });

  revalidatePath("/admin/questions");
  revalidatePath("/admin/question-images");
  return { success: true as const };
}
