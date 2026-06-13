import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PlacementStartCard } from "@/components/placement/placement-start-card";
import { CambaMascot } from "@/components/kids/camba-mascot";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function PlacementPage() {
  const session = await auth();

  const papers = await db.examPaper.findMany({
    where: { paperKind: "PLACEMENT", published: true },
    orderBy: { title: "asc" },
  });

  const recentAttempts = session
    ? await db.attempt.findMany({
        where: {
          userId: session.user.id,
          paper: { paperKind: "PLACEMENT" },
          status: { in: ["SUBMITTED", "GRADED"] },
        },
        include: { paper: true },
        orderBy: { submittedAt: "desc" },
        take: 5,
      })
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-10 flex flex-wrap items-center gap-4">
        <CambaMascot size="lg" mood="think" />
        <div className="max-w-2xl">
          <h1 className="text-3xl font-extrabold kid-gradient-text">Test trình độ</h1>
          <p className="mt-2 font-semibold leading-relaxed text-muted-foreground">
            Làm bài placement miễn phí — <strong>không cần đăng ký</strong> (chỉ cần Họ tên & SĐT).
            Kết quả CEFR và cấp độ Cambridge chi tiết từng kỹ năng.
          </p>
        </div>
      </div>

      <div className="mb-12 grid gap-6 md:grid-cols-2">
        {papers.map((paper) => (
          <PlacementStartCard
            key={paper.id}
            paper={{
              id: paper.id,
              title: paper.title,
              description: paper.description,
              timeLimit: paper.timeLimit,
            }}
            isLoggedIn={!!session}
          />
        ))}
      </div>

      {recentAttempts.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-extrabold">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Kết quả gần đây của bạn
          </h2>
          <div className="space-y-3">
            {recentAttempts.map((a) => (
              <Link
                key={a.id}
                href={`/placement/results/${a.id}`}
                className="block rounded-xl border-2 p-4 transition-colors hover:bg-purple-50"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold">{a.paper.title}</span>
                  {a.score !== null && a.maxScore && (
                    <Badge variant="secondary">
                      {Math.round((a.score / a.maxScore) * 100)}%
                    </Badge>
                  )}
                </div>
                {a.submittedAt && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(a.submittedAt).toLocaleString("vi-VN")}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
