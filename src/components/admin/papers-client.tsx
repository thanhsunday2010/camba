"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EXAM_LEVELS, SKILLS } from "@/lib/constants";
import {
  addQuestionToPaperAction,
  createPaperAction,
  deletePaperAction,
  removeQuestionFromPaperAction,
} from "@/lib/actions/exam";
import { formatExamLevel, formatSkill } from "@/lib/constants";
import { ExamLevel, Skill } from "@prisma/client";

type PaperRow = {
  id: string;
  title: string;
  level: ExamLevel;
  skill: Skill;
  timeLimit: number | null;
  isMockTest: boolean;
  published: boolean;
  questions: {
    id: string;
    orderIndex: number;
    question: { id: string; title: string | null; type: string };
  }[];
};

type QuestionRow = {
  id: string;
  title: string | null;
  type: string;
  level: ExamLevel;
  skill: Skill;
};

export function AdminPapersClient({
  papers,
  questions,
}: {
  papers: PaperRow[];
  questions: QuestionRow[];
}) {
  const [loading, setLoading] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<string | null>(
    papers[0]?.id ?? null
  );
  const [addQuestionId, setAddQuestionId] = useState("");

  async function handleCreatePaper(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await createPaperAction(new FormData(e.currentTarget));
    setLoading(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Đã tạo đề thi");
      e.currentTarget.reset();
    }
  }

  async function handleAddQuestion() {
    if (!selectedPaper || !addQuestionId) return;
    const result = await addQuestionToPaperAction(selectedPaper, addQuestionId);
    if (result.error) toast.error(result.error);
    else toast.success("Đã thêm câu vào đề");
  }

  const activePaper = papers.find((p) => p.id === selectedPaper);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Quản lý đề thi</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tạo đề mới</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePaper} className="space-y-4">
              <div>
                <Label htmlFor="title">Tiêu đề</Label>
                <Input id="title" name="title" required placeholder="KET Reading Mock 2" />
              </div>
              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Input id="description" name="description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cấp độ</Label>
                  <select name="level" className="mt-1 flex h-10 w-full rounded-md border px-3 text-sm">
                    {EXAM_LEVELS.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Kỹ năng</Label>
                  <select name="skill" className="mt-1 flex h-10 w-full rounded-md border px-3 text-sm">
                    {SKILLS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="timeLimit">Thời gian (giây)</Label>
                <Input id="timeLimit" name="timeLimit" type="number" placeholder="1800" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isMockTest" />
                Chế độ thi thử (Mock test)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="published" defaultChecked />
                Xuất bản ngay
              </label>
              <Button type="submit" disabled={loading}>
                Tạo đề
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thêm câu vào đề</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Chọn đề</Label>
              <select
                value={selectedPaper ?? ""}
                onChange={(e) => setSelectedPaper(e.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border px-3 text-sm"
              >
                {papers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.questions.length} câu)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Chọn câu hỏi</Label>
              <select
                value={addQuestionId}
                onChange={(e) => setAddQuestionId(e.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border px-3 text-sm"
              >
                <option value="">-- Chọn câu --</option>
                {questions.map((q) => (
                  <option key={q.id} value={q.id}>
                    [{q.type}] {q.title ?? q.id.slice(0, 8)} · {formatSkill(q.skill)}
                  </option>
                ))}
              </select>
            </div>
            <Button type="button" onClick={handleAddQuestion} disabled={!addQuestionId}>
              Thêm câu
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Danh sách đề ({papers.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {papers.map((paper) => (
            <div key={paper.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{paper.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatExamLevel(paper.level)} · {formatSkill(paper.skill)} ·{" "}
                    {paper.questions.length} câu
                    {paper.timeLimit ? ` · ${Math.round(paper.timeLimit / 60)} phút` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {paper.isMockTest && <Badge>Mock test</Badge>}
                  <Badge variant={paper.published ? "success" : "outline"}>
                    {paper.published ? "Published" : "Draft"}
                  </Badge>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      if (!confirm("Xóa đề này?")) return;
                      await deletePaperAction(paper.id);
                      toast.success("Đã xóa");
                    }}
                  >
                    Xóa
                  </Button>
                </div>
              </div>
              {paper.questions.length > 0 && (
                <ol className="mt-3 space-y-1 text-sm">
                  {paper.questions.map((pq, i) => (
                    <li key={pq.id} className="flex justify-between rounded bg-slate-50 px-2 py-1">
                      <span>
                        {i + 1}. {pq.question.title ?? pq.question.type}
                      </span>
                      <button
                        type="button"
                        className="text-red-600 hover:underline"
                        onClick={async () => {
                          await removeQuestionFromPaperAction(pq.id);
                          toast.success("Đã gỡ câu");
                        }}
                      >
                        Gỡ
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
