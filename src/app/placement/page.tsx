import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, GraduationCap, Sparkles } from "lucide-react";

export default async function PlacementPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const papers = await db.examPaper.findMany({
    where: { paperKind: "PLACEMENT", published: true },
    orderBy: { title: "asc" },
  });

  const recentAttempts = await db.attempt.findMany({
    where: {
      userId: session.user.id,
      paper: { paperKind: "PLACEMENT" },
      status: { in: ["SUBMITTED", "GRADED"] },
    },
    include: { paper: true },
    orderBy: { submittedAt: "desc" },
    take: 5,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-10 max-w-2xl">
        <div className="mb-3 flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-cambridge-600" />
          <h1 className="text-3xl font-bold">Test trình độ</h1>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Làm bài test placement để biết trình độ CEFR (Pre A1–C1) và cấp độ Cambridge phù hợp
          (Starters, Movers, Flyers, KET, PET, FCE). Kết quả đánh giá chi tiết từng kỹ năng
          Reading, Listening và Use of English.
        </p>
      </div>

      <div className="mb-12 grid gap-6 md:grid-cols-2">
        {papers.map((paper) => (
          <Card key={paper.id} className="border-cambridge-100">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-xl">{paper.title}</CardTitle>
                <Badge>Placement</Badge>
              </div>
              {paper.description && (
                <CardDescription>{paper.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {paper.timeLimit && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {Math.floor(paper.timeLimit / 60)} phút
                </p>
              )}
              <Button asChild className="w-full">
                <Link href={`/practice/${paper.id}`}>Bắt đầu làm bài</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {recentAttempts.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <Sparkles className="h-5 w-5 text-cambridge-600" />
            Kết quả gần đây
          </h2>
          <div className="space-y-3">
            {recentAttempts.map((a) => (
              <Link
                key={a.id}
                href={`/placement/results/${a.id}`}
                className="block rounded-lg border p-4 transition-colors hover:bg-slate-50"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{a.paper.title}</span>
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
