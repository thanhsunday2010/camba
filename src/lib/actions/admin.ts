"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ExamLevel, Role } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { error: "Không có quyền" as const, session: null };
  }
  return { session, error: null };
}

const userCreateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]),
  grade: z.string().optional(),
  targetExam: z.enum(["STARTERS", "MOVERS", "FLYERS", "KET", "PET", "FCE"]),
});

const userUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6).optional().or(z.literal("")),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]),
  grade: z.string().optional(),
  targetExam: z.enum(["STARTERS", "MOVERS", "FLYERS", "KET", "PET", "FCE"]),
});

export async function createUserAction(formData: FormData) {
  const { error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const parsed = userCreateSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    grade: formData.get("grade") || undefined,
    targetExam: formData.get("targetExam"),
  });

  if (!parsed.success) return { error: "Thông tin không hợp lệ" };

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: "Email đã được sử dụng" };

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role as Role,
      grade: parsed.data.grade,
      targetExam: parsed.data.targetExam as ExamLevel,
    },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateUserAction(formData: FormData) {
  const { session, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const parsed = userUpdateSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password") || undefined,
    role: formData.get("role"),
    grade: formData.get("grade") || undefined,
    targetExam: formData.get("targetExam"),
  });

  if (!parsed.success) return { error: "Thông tin không hợp lệ" };

  const user = await db.user.findUnique({ where: { id: parsed.data.id } });
  if (!user) return { error: "Không tìm thấy tài khoản" };

  if (parsed.data.email !== user.email) {
    const dup = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (dup) return { error: "Email đã được sử dụng" };
  }

  const data: {
    name: string;
    email: string;
    role: Role;
    grade?: string;
    targetExam: ExamLevel;
    passwordHash?: string;
  } = {
    name: parsed.data.name,
    email: parsed.data.email,
    role: parsed.data.role as Role,
    grade: parsed.data.grade,
    targetExam: parsed.data.targetExam as ExamLevel,
  };

  if (parsed.data.password && parsed.data.password.length >= 6) {
    data.passwordHash = await bcrypt.hash(parsed.data.password, 10);
  }

  await db.user.update({ where: { id: parsed.data.id }, data });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function deleteUserAction(userId: string) {
  const { session, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  if (session!.user.id === userId) {
    return { error: "Không thể xóa tài khoản đang đăng nhập" };
  }

  await db.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
  return { success: true };
}
