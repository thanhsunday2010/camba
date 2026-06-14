"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ExamLevel } from "@prisma/client";
import { isValidPhone, normalizePhone } from "@/lib/auth/phone";

const MAX_AVATAR_BYTES = 512 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const examLevelSchema = z.enum(["STARTERS", "MOVERS", "FLYERS", "KET", "PET", "FCE"]);

const profileSchema = z.object({
  name: z.string().trim().min(2, "Họ tên cần ít nhất 2 ký tự").max(100),
  grade: z.string().trim().max(50).optional().or(z.literal("")),
  targetExam: examLevelSchema,
  dateOfBirth: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || !Number.isNaN(Date.parse(value)),
      "Ngày sinh không hợp lệ"
    ),
  email: z.string().trim().email("Email không hợp lệ").optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6, "Mật khẩu mới cần ít nhất 6 ký tự"),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

async function avatarFromFile(file: File | null): Promise<string | null | undefined> {
  if (!file || file.size === 0) return undefined;
  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error("Ảnh đại diện tối đa 512KB");
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Chỉ hỗ trợ ảnh JPG, PNG, WEBP, GIF");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}

function parseDateOfBirth(value: string | undefined): Date | null {
  if (!value?.trim()) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Ngày sinh không hợp lệ");
  }
  return date;
}

export type UserProfileData = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
  grade: string | null;
  targetExam: ExamLevel;
  dateOfBirth: string | null;
  hasPassword: boolean;
};

export async function getUserProfileAction(): Promise<
  { profile: UserProfileData } | { error: string }
> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Chưa đăng nhập" };

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      grade: true,
      targetExam: true,
      dateOfBirth: true,
      passwordHash: true,
    },
  });

  if (!user) return { error: "Không tìm thấy tài khoản" };

  return {
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      image: user.image,
      grade: user.grade,
      targetExam: user.targetExam,
      dateOfBirth: user.dateOfBirth
        ? user.dateOfBirth.toISOString().slice(0, 10)
        : null,
      hasPassword: Boolean(user.passwordHash),
    },
  };
}

export async function updateProfileAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Chưa đăng nhập" };

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    grade: formData.get("grade") ?? "",
    targetExam: formData.get("targetExam"),
    dateOfBirth: formData.get("dateOfBirth") ?? "",
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  const email = parsed.data.email?.trim() ? parsed.data.email.trim().toLowerCase() : null;
  const phoneRaw = parsed.data.phone?.trim() ?? "";
  let phone: string | null = null;
  if (phoneRaw) {
    if (!isValidPhone(phoneRaw)) {
      return { error: "Số điện thoại không hợp lệ (VD: 0912345678)" };
    }
    phone = normalizePhone(phoneRaw)!;
  }

  if (!email && !phone) {
    return { error: "Cần ít nhất email hoặc số điện thoại" };
  }

  try {
    const existing = await db.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, phone: true },
    });
    if (!existing) return { error: "Không tìm thấy tài khoản" };

    if (email && email !== existing.email) {
      const taken = await db.user.findUnique({ where: { email } });
      if (taken && taken.id !== session.user.id) {
        return { error: "Email đã được sử dụng" };
      }
    }

    if (phone && phone !== existing.phone) {
      const taken = await db.user.findUnique({ where: { phone } });
      if (taken && taken.id !== session.user.id) {
        return { error: "Số điện thoại đã được sử dụng" };
      }
    }

    const removeAvatar = formData.get("removeAvatar") === "true";
    const avatarFile = formData.get("avatar") as File | null;
    let image: string | null | undefined = undefined;

    if (removeAvatar) {
      image = null;
    } else {
      image = await avatarFromFile(avatarFile);
    }

    const dateOfBirth = parseDateOfBirth(parsed.data.dateOfBirth);

    const updated = await db.user.update({
      where: { id: session.user.id },
      data: {
        name: parsed.data.name,
        grade: parsed.data.grade?.trim() || null,
        targetExam: parsed.data.targetExam as ExamLevel,
        dateOfBirth,
        email,
        phone,
        ...(image !== undefined ? { image } : {}),
      },
      select: {
        name: true,
        image: true,
        targetExam: true,
      },
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      profile: {
        name: updated.name,
        image: updated.image,
        targetExam: updated.targetExam,
      },
    };
  } catch (error) {
    console.error("[updateProfileAction]", error);
    if (error instanceof Error) return { error: error.message };
    return { error: "Không thể cập nhật hồ sơ" };
  }
}

export async function updatePasswordAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Chưa đăng nhập" };

  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  if (!user?.passwordHash) {
    return { error: "Tài khoản đăng nhập bằng Google/Facebook — không đổi mật khẩu tại đây" };
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return { error: "Mật khẩu hiện tại không đúng" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await db.user.update({
    where: { id: session.user.id },
    data: { passwordHash },
  });

  revalidatePath("/dashboard");
  return { success: true };
}
