import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { formatExamLevel } from "@/lib/constants";
import { LevelPicker } from "@/components/exam/level-picker";
import { CambaMascot } from "@/components/kids/camba-mascot";

export default async function ExamsHubPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { targetExam: true },
  });
  if (!user) redirect("/login");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <CambaMascot size="lg" mood="wave" />
        <div>
          <h1 className="text-3xl font-extrabold kid-gradient-text">Chọn level luyện tập</h1>
          <p className="mt-1 max-w-xl font-semibold text-muted-foreground">
            Bạn có thể đổi level bất cứ lúc nào — không cần tạo tài khoản mới.
            Level mặc định hiện tại:{" "}
            <strong className="text-purple-700">{formatExamLevel(user.targetExam)}</strong>
          </p>
        </div>
      </div>

      <LevelPicker currentLevel={user.targetExam} variant="full" />

      <p className="mt-8 text-center text-sm font-medium text-muted-foreground">
        Muốn biết trình độ?{" "}
        <Link href="/placement" className="font-bold text-purple-600 underline">
          Làm bài test trình độ
        </Link>
      </p>
    </div>
  );
}
