"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { ExamLevel, Role } from "@prisma/client";
import { requireAdminPermission } from "@/lib/admin/access";

const userCreateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]),
  grade: z.string().optional(),
  targetExam: z.enum(["STARTERS", "MOVERS", "FLYERS", "KET", "PET", "FCE"]),
  adminRoleId: z.string().optional(),
});

const userUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6).optional().or(z.literal("")),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]),
  grade: z.string().optional(),
  targetExam: z.enum(["STARTERS", "MOVERS", "FLYERS", "KET", "PET", "FCE"]),
  adminRoleId: z.string().optional(),
});

export async function createUserAction(formData: FormData) {
  const { error: authError } = await requireAdminPermission("users.manage");
  if (authError) return { error: authError };

  const parsed = userCreateSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    grade: formData.get("grade") || undefined,
    targetExam: formData.get("targetExam"),
    adminRoleId: formData.get("adminRoleId") || undefined,
  });

  if (!parsed.success) return { error: "Thông tin không hợp lệ" };

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: "Email đã được sử dụng" };

  let adminRoleId: string | null = null;
  if (parsed.data.role === "ADMIN" && parsed.data.adminRoleId) {
    const role = await db.adminRole.findUnique({ where: { id: parsed.data.adminRoleId } });
    if (!role) return { error: "Vai trò admin không hợp lệ" };
    adminRoleId = role.id;
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role as Role,
      grade: parsed.data.grade,
      targetExam: parsed.data.targetExam as ExamLevel,
      adminRoleId,
    },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateUserAction(formData: FormData) {
  const { session, error: authError } = await requireAdminPermission("users.manage");
  if (authError) return { error: authError };

  const parsed = userUpdateSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password") || undefined,
    role: formData.get("role"),
    grade: formData.get("grade") || undefined,
    targetExam: formData.get("targetExam"),
    adminRoleId: formData.get("adminRoleId") || undefined,
  });

  if (!parsed.success) return { error: "Thông tin không hợp lệ" };

  const user = await db.user.findUnique({ where: { id: parsed.data.id } });
  if (!user) return { error: "Không tìm thấy tài khoản" };

  if (parsed.data.email !== user.email) {
    const dup = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (dup) return { error: "Email đã được sử dụng" };
  }

  let adminRoleId: string | null = null;
  if (parsed.data.role === "ADMIN" && parsed.data.adminRoleId) {
    const role = await db.adminRole.findUnique({ where: { id: parsed.data.adminRoleId } });
    if (!role) return { error: "Vai trò admin không hợp lệ" };
    adminRoleId = role.id;
  }

  const data: {
    name: string;
    email: string;
    role: Role;
    grade?: string;
    targetExam: ExamLevel;
    passwordHash?: string;
    adminRoleId: string | null;
  } = {
    name: parsed.data.name,
    email: parsed.data.email,
    role: parsed.data.role as Role,
    grade: parsed.data.grade,
    targetExam: parsed.data.targetExam as ExamLevel,
    adminRoleId: parsed.data.role === "ADMIN" ? adminRoleId : null,
  };

  if (parsed.data.password && parsed.data.password.length >= 6) {
    data.passwordHash = await bcrypt.hash(parsed.data.password, 10);
  }

  await db.user.update({ where: { id: parsed.data.id }, data });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function deleteUserAction(userId: string) {
  const { session, error: authError } = await requireAdminPermission("users.manage");
  if (authError) return { error: authError };

  if (session!.user.id === userId) {
    return { error: "Không thể xóa tài khoản đang đăng nhập" };
  }

  await db.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
  return { success: true };
}
