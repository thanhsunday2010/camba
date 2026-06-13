"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { BugReportStatus } from "@prisma/client";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const reportSchema = z.object({
  message: z.string().min(10, "Mô tả lỗi cần ít nhất 10 ký tự").max(5000),
  pageUrl: z.string().optional(),
});

async function fileToDataUrl(file: File): Promise<string | null> {
  if (!file.size) return null;
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Ảnh tối đa 2MB");
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Chỉ hỗ trợ ảnh JPG, PNG, WEBP, GIF");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}

export async function submitBugReportAction(formData: FormData) {
  const session = await auth();

  const parsed = reportSchema.safeParse({
    message: formData.get("message"),
    pageUrl: formData.get("pageUrl") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  const imageFile = formData.get("image") as File | null;
  let imageData: string | null = null;

  try {
    if (imageFile && imageFile.size > 0) {
      imageData = await fileToDataUrl(imageFile);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Ảnh không hợp lệ" };
  }

  await db.bugReport.create({
    data: {
      userId: session?.user?.id ?? null,
      userEmail: session?.user?.email ?? null,
      userName: session?.user?.name ?? null,
      pageUrl: parsed.data.pageUrl ?? null,
      message: parsed.data.message.trim(),
      imageData,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/reports");
  return { success: true };
}

export async function updateBugReportStatusAction(id: string, status: BugReportStatus) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { error: "Không có quyền" };
  }

  await db.bugReport.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/reports");
  return { success: true };
}

export async function deleteBugReportAction(id: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { error: "Không có quyền" };
  }

  await db.bugReport.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/admin/reports");
  return { success: true };
}
