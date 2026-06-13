"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  grade: z.string().optional(),
  targetExam: z.enum(["STARTERS", "MOVERS", "FLYERS", "KET", "PET", "FCE"]),
});

function dbErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (
    message.includes("Can't reach database server") ||
    message.includes("P1001") ||
    message.includes("P1017") ||
    message.includes("Connection")
  ) {
    return "Không kết nối được database. Kiểm tra DATABASE_URL trên Vercel (Supabase pooler :6543).";
  }
  if (message.includes("does not exist") || message.includes("P2021")) {
    return "Database chưa có bảng. Chạy: npx prisma migrate deploy && npm run db:seed";
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
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    grade: formData.get("grade") || undefined,
    targetExam: formData.get("targetExam"),
  });

  if (!parsed.success) {
    return { error: "Thông tin không hợp lệ" };
  }

  try {
    const existing = await db.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (existing) {
      return { error: "Email đã được sử dụng" };
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);

    await db.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        grade: parsed.data.grade,
        targetExam: parsed.data.targetExam,
        role: "STUDENT",
      },
    });
  } catch (error) {
    console.error("[registerAction]", error);
    return { error: dbErrorMessage(error) };
  }

  try {
    const result = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    if (typeof result === "string" && isFailedSignIn(result)) {
      return { error: "Đăng ký thành công nhưng đăng nhập thất bại. Hãy thử đăng nhập thủ công." };
    }
    return { success: true };
  } catch (error) {
    console.error("[registerAction signIn]", error);
    if (error instanceof AuthError) {
      return { error: "Đăng ký thành công nhưng đăng nhập thất bại. Hãy thử đăng nhập thủ công." };
    }
    return { error: dbErrorMessage(error) };
  }
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (typeof result === "string" && isFailedSignIn(result)) {
      return { error: "Email hoặc mật khẩu không đúng" };
    }
    return { success: true };
  } catch (error) {
    console.error("[loginAction]", error);
    if (error instanceof AuthError) {
      return { error: "Email hoặc mật khẩu không đúng" };
    }
    return { error: dbErrorMessage(error) };
  }
}

export async function logoutAction() {
  const { signOut } = await import("@/auth");
  await signOut({ redirectTo: "/" });
}
