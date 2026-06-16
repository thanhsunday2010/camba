import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { formatExamLevel } from "@/lib/constants";
import { LevelPicker } from "@/components/exam/level-picker";
import { CambaMascot } from "@/components/kids/camba-mascot";
import { Card, CardContent } from "@/components/ui/card";

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

      <Card className="mt-8 border-2 border-rose-200 bg-gradient-to-br from-rose-50/60 to-white">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-6">
          <div>
            <p className="text-lg font-extrabold text-rose-800">🎤 Luyện thi Speaking IELTS</p>
            <p className="mt-1 max-w-xl text-sm font-medium text-muted-foreground">
              Luyện từng Part hoặc mock full · AI chấm band IELTS · gợi ý part yếu
            </p>
          </div>
          <Link
            href="/ielts/speaking"
            className="kid-btn-fun inline-flex rounded-full bg-rose-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-700"
          >
            Vào luyện Speaking IELTS
          </Link>
        </CardContent>
      </Card>

      <p className="mt-8 text-center text-sm font-medium text-muted-foreground">
        Muốn biết trình độ?{" "}
        <Link href="/placement" className="font-bold text-purple-600 underline">
          Làm bài test trình độ
        </Link>
      </p>
    </div>
  );
}
