import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { assignPaperAction } from "@/lib/actions/exam";
import { formatExamLevel, formatSkill } from "@/lib/constants";

export default async function TeacherPage() {
  const session = await auth();
  if (!session || !["TEACHER", "ADMIN"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const students = await db.user.findMany({
    where: { role: "STUDENT" },
    select: { id: true, name: true, email: true, targetExam: true, streak: true },
    orderBy: { name: "asc" },
  });

  const papers = await db.examPaper.findMany({
    where: { published: true },
    orderBy: { title: "asc" },
  });

  const assignments = await db.assignment.findMany({
    where: { teacherId: session.user.id },
    include: {
      paper: true,
      student: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Dashboard Giáo viên</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Giao bài tập</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={assignPaperAction} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Chọn đề</label>
                <select name="paperId" className="mt-1 flex h-10 w-full rounded-md border px-3 text-sm" required>
                  {papers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({formatSkill(p.skill)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Học sinh</label>
                <select name="studentId" className="mt-1 flex h-10 w-full rounded-md border px-3 text-sm" required>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Hạn nộp (tuỳ chọn)</label>
                <input type="date" name="dueDate" className="mt-1 flex h-10 w-full rounded-md border px-3 text-sm" />
              </div>
              <Button type="submit">Giao bài</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách học sinh ({students.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {students.map((s) => (
                <div key={s.id} className="flex justify-between rounded-lg border p-3 text-sm">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-muted-foreground">{s.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{s.targetExam}</Badge>
                    <p className="mt-1 text-xs">{s.streak} 🔥 streak</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Bài tập đã giao</CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-muted-foreground">Chưa giao bài nào.</p>
          ) : (
            <div className="space-y-2">
              {assignments.map((a) => (
                <div key={a.id} className="flex justify-between rounded-lg border p-3 text-sm">
                  <div>
                    <p className="font-medium">{a.paper.title}</p>
                    <p className="text-muted-foreground">
                      → {a.student.name} · {formatExamLevel(a.paper.level)}
                    </p>
                  </div>
                  <Badge variant={a.completed ? "success" : "secondary"}>
                    {a.completed ? "Hoàn thành" : "Chưa xong"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {session.user.role === "ADMIN" && (
        <div className="mt-4">
          <Link href="/admin/questions">
            <Button variant="outline">Quản lý câu hỏi</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
