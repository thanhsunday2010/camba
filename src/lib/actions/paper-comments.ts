"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const commentSchema = z.object({
  paperId: z.string().min(1),
  body: z.string().trim().min(1, "Nội dung không được để trống").max(2000),
});

export type PaperCommentView = {
  id: string;
  body: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

export async function getPaperComments(paperId: string): Promise<PaperCommentView[]> {
  return db.paperComment.findMany({
    where: { paperId },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      body: true,
      createdAt: true,
      user: {
        select: { id: true, name: true, image: true },
      },
    },
  });
}

export async function createPaperCommentAction(paperId: string, body: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Chưa đăng nhập" };

  const parsed = commentSchema.safeParse({ paperId, body });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Nội dung không hợp lệ" };
  }

  const paper = await db.examPaper.findUnique({
    where: { id: paperId },
    select: { id: true, published: true },
  });
  if (!paper?.published) return { error: "Không tìm thấy đề" };

  const comment = await db.paperComment.create({
    data: {
      paperId,
      userId: session.user.id,
      body: parsed.data.body,
    },
    select: {
      id: true,
      body: true,
      createdAt: true,
      user: {
        select: { id: true, name: true, image: true },
      },
    },
  });

  revalidatePath(`/practice/${paperId}`);
  return { ok: true as const, comment };
}
