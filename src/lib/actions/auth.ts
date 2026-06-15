"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { ExamLevel } from "@prisma/client";
import { isPhoneInput, isValidPhone, normalizePhone } from "@/lib/auth/phone";
import {
  applyReferralBonusForNewUser,
} from "@/lib/referral/apply-bonus.server";
import {
  generateUniqueReferralCode,
} from "@/lib/referral/codes";

const registerSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    password: z.string().min(6),
    grade: z.string().optional(),
    targetExam: z.enum(["STARTERS", "MOVERS", "FLYERS", "KET", "PET", "FCE"]),
  })
  .refine((data) => Boolean(data.email?.trim() || data.phone?.trim()), {
    message: "Cần email hoặc số điện thoại",
  });

function dbErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("database string is invalid") || message.includes("illegal characters")) {
    return "DATABASE_URL trên Vercel không hợp lệ — copy lại từ Supabase (pooler :6543), mã hoá ký tự đặc biệt trong mật khẩu (@→%40, #→%23), không bọc dấu ngoặc kép.";
  }
  if (
    message.includes("Can't reach database server") ||
    message.includes("P1001") ||
    message.includes("P1017") ||
    message.includes("Connection")
  ) {
    return "Không kết nối được database. Trên Vercel: đặt DATABASE_URL = pooler :6543 (Transaction mode), DIRECT_URL = direct :5432, kiểm tra Supabase project không bị pause, và đã chạy npm run db:deploy.";
  }
  if (message.includes("does not exist") || message.includes("P2021")) {
    return "Database chưa có bảng. Chạy: npx prisma migrate deploy && npm run db:seed";
  }
  if (message.includes("Unique constraint") || message.includes("P2002")) {
    return "Email hoặc số điện thoại đã được sử dụng";
  }
  return "Lỗi hệ thống. Vui lòng thử lại sau.";
}

function isFailedSignIn(url: string | undefined): boolean {
  if (!url) return true;
  try {
    const parsed = new URL(url, "http://localhost");
    if (parsed.searchParams.has("error")) return true;
    return parsed.pathname.includes("/api/auth/signin");
  } catch {
    return url.includes("error=");
  }
}

export async function registerAction(formData: FormData) {
  const emailRaw = String(formData.get("email") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: emailRaw,
    phone: phoneRaw,
    password: formData.get("password"),
    grade: formData.get("grade") || undefined,
    targetExam: formData.get("targetExam"),
  });

  if (!parsed.success) {
    return { error: "Thông tin không hợp lệ. Cần email hoặc số điện thoại hợp lệ." };
  }

  const email = emailRaw ? emailRaw.toLowerCase() : undefined;
  let phone: string | undefined;
  if (phoneRaw) {
    if (!isValidPhone(phoneRaw)) {
      return { error: "Số điện thoại không hợp lệ (VD: 0912345678)" };
    }
    phone = normalizePhone(phoneRaw)!;
  }

  if (!email && !phone) {
    return { error: "Vui lòng nhập email hoặc số điện thoại" };
  }

  let referralBonus = false;

  try {
    if (email) {
      const existingEmail = await db.user.findUnique({ where: { email } });
      if (existingEmail) return { error: "Email đã được sử dụng" };
    }
    if (phone) {
      const existingPhone = await db.user.findUnique({ where: { phone } });
      if (existingPhone) return { error: "Số điện thoại đã được sử dụng" };
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const referralCode = await generateUniqueReferralCode();

    const newUser = await db.user.create({
      data: {
        name: parsed.data.name,
        email: email ?? null,
        phone: phone ?? null,
        passwordHash,
        grade: parsed.data.grade,
        targetExam: parsed.data.targetExam,
        role: "STUDENT",
        referralCode,
      },
    });

    const referral = await applyReferralBonusForNewUser(newUser.id);
    referralBonus = referral.applied;
  } catch (error) {
    console.error("[registerAction]", error);
    return { error: dbErrorMessage(error) };
  }

  return {
    success: true,
    identifier: email ?? phoneRaw,
    referralBonus: referralBonus,
  };
}

export async function loginAction(formData: FormData) {
  const identifier = String(formData.get("identifier") ?? formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!identifier || password.length < 6) {
    return { error: "Email/SĐT hoặc mật khẩu không hợp lệ" };
  }

  if (isPhoneInput(identifier) && !isValidPhone(identifier)) {
    return { error: "Số điện thoại không hợp lệ" };
  }

  try {
    const result = await signIn("credentials", {
      identifier: isPhoneInput(identifier) ? identifier : identifier.toLowerCase(),
      password,
      redirect: false,
    });
    if (typeof result === "string" && isFailedSignIn(result)) {
      return { error: "Email/SĐT hoặc mật khẩu không đúng" };
    }
    return { success: true };
  } catch (error) {
    console.error("[loginAction]", error);
    if (error instanceof AuthError) {
      return { error: "Email/SĐT hoặc mật khẩu không đúng" };
    }
    return { error: dbErrorMessage(error) };
  }
}

export async function logoutAction() {
  const { signOut } = await import("@/auth");
  await signOut({ redirect: false });
  redirect("/");
}

const levelSchema = z.enum(["STARTERS", "MOVERS", "FLYERS", "KET", "PET", "FCE"]);

export async function updateTargetExamAction(level: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Chưa đăng nhập" };
  }

  const parsed = levelSchema.safeParse(level);
  if (!parsed.success) {
    return { error: "Level không hợp lệ" };
  }

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: { targetExam: parsed.data as ExamLevel },
    });
    revalidatePath("/dashboard");
    revalidatePath("/exams");
    return { success: true, level: parsed.data };
  } catch (error) {
    console.error("[updateTargetExamAction]", error);
    return { error: "Không thể cập nhật level" };
  }
}
