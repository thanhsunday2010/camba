"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AdminNav } from "@/components/admin/admin-nav";
import {
  EXAM_LEVELS,
  PAPER_KINDS,
  SKILLS,
  formatExamLevel,
  formatPaperKind,
  formatSkill,
} from "@/lib/constants";
import {
  addQuestionToPaperAction,
  createPaperAction,
  deletePaperAction,
  getQuestionByIdAction,
  movePaperQuestionAction,
  removeQuestionFromPaperAction,
  updatePaperAction,
} from "@/lib/actions/exam";
import { ExamLevel, PaperKind, Skill } from "@prisma/client";
import { ChevronDown, ChevronUp, Loader2, Pencil } from "lucide-react";
import {
  QuestionForm,
  type QuestionFormData,
  type QuestionListItem,
} from "@/components/admin/question-form";

type PaperQuestionRow = {
  id: string;
  orderIndex: number;
  question: QuestionListItem;
};

type PaperRow = {
  id: string;
  title: string;
  description: string | null;
  level: ExamLevel;
  skill: Skill;
  paperKind: PaperKind;
  timeLimit: number | null;
  isMockTest: boolean;
  published: boolean;
  sections: unknown;
  questions: PaperQuestionRow[];
};

type QuestionRow = {
  id: string;
  title: string | null;
  type: string;
  level: ExamLevel;
  skill: Skill;
};

const SECTIONS_EXAMPLE = `[
  { "skill": "READING", "label": "Reading", "startIndex": 0, "endIndex": 20, "timeLimit": 900 },
  { "skill": "LISTENING", "label": "Listening", "startIndex": 20, "endIndex": 35, "timeLimit": 600 }
]`;

function PaperForm({
  paper,
  onDone,
  loading,
  setLoading,
}: {
  paper?: PaperRow;
  onDone: () => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}) {
  const isEdit = Boolean(paper);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    if (isEdit && paper) fd.set("id", paper.id);
    const result = isEdit
      ? await updatePaperAction(fd)
      : await createPaperAction(fd);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success(isEdit ? "Đã cập nhật đề" : "Đã tạo đề thi");
      if (!isEdit) e.currentTarget.reset();
      onDone();
    }
  }

  const sectionsStr =
    paper?.sections && Array.isArray(paper.sections)
      ? JSON.stringify(paper.sections, null, 2)
      : "";

  return (
    <form key={paper?.id ?? "create"} onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Tiêu đề</Label>
        <Input id="title" name="title" required defaultValue={paper?.title ?? ""} />
      </div>
      <div>
        <Label htmlFor="description">Mô tả</Label>
        <Input id="description" name="description" defaultValue={paper?.description ?? ""} />
      </div>
      <div>
        <Label>Loại đề</Label>
        <select
          name="paperKind"
          defaultValue={paper?.paperKind ?? "PRACTICE"}
          className="mt-1 flex h-10 w-full rounded-md border px-3 text-sm"
        >
          {PAPER_KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label} — {k.description}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Cấp độ</Label>
          <select
            name="level"
            defaultValue={paper?.level ?? "KET"}
            className="mt-1 flex h-10 w-full rounded-md border px-3 text-sm"
          >
            {EXAM_LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Kỹ năng chính</Label>
          <select
            name="skill"
            defaultValue={paper?.skill ?? "READING"}
            className="mt-1 flex h-10 w-full rounded-md border px-3 text-sm"
          >
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
        <Input
          id="timeLimit"
          name="timeLimit"
          type="number"
          placeholder="1800"
          defaultValue={paper?.timeLimit ?? ""}
        />
      </div>
      <div>
        <Label htmlFor="sections">Sections (JSON — cho placement/mock nhiều phần)</Label>
        <Textarea
          id="sections"
          name="sections"
          rows={5}
          placeholder={SECTIONS_EXAMPLE}
          defaultValue={sectionsStr}
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isMockTest" defaultChecked={paper?.isMockTest ?? false} />
        Chế độ thi thử (Mock)
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="published"
          defaultChecked={paper?.published ?? true}
        />
        Xuất bản
      </label>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {isEdit ? "Lưu đề" : "Tạo đề"}
        </Button>
        {isEdit && (
          <Button type="button" variant="outline" onClick={onDone}>
            Huỷ
          </Button>
        )}
      </div>
    </form>
  );
}

export function AdminPapersClient({
  papers,
  questions,
  permissions,
}: {
  papers: PaperRow[];
  questions: QuestionRow[];
  permissions: import("@/lib/admin/permissions").AdminPermission[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<string | null>(papers[0]?.id ?? null);
  const [addQuestionId, setAddQuestionId] = useState("");
  const [editingPaper, setEditingPaper] = useState<PaperRow | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<QuestionFormData | null>(null);
  const [loadingQuestionId, setLoadingQuestionId] = useState<string | null>(null);
  const [kindFilter, setKindFilter] = useState<string>("ALL");

  async function openQuestionEdit(questionId: string) {
    if (editingQuestion?.id === questionId) {
      setEditingQuestion(null);
      return;
    }
    setLoadingQuestionId(questionId);
    const result = await getQuestionByIdAction(questionId);
    setLoadingQuestionId(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setEditingQuestion(result.question);
  }

  const filteredPapers = useMemo(() => {
    if (kindFilter === "ALL") return papers;
    return papers.filter((p) => p.paperKind === kindFilter);
  }, [papers, kindFilter]);

  async function handleAddQuestion() {
    if (!selectedPaper || !addQuestionId) return;
    const result = await addQuestionToPaperAction(selectedPaper, addQuestionId);
    if (result.error) toast.error(result.error);
    else toast.success("Đã thêm câu vào đề");
    router.refresh();
  }

  const activePaper = papers.find((p) => p.id === selectedPaper);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold">Quản lý đề thi</h1>
      <AdminNav currentPath="/admin/papers" permissions={permissions} />

      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={kindFilter === "ALL" ? "default" : "outline"}
          onClick={() => setKindFilter("ALL")}
        >
          Tất cả
        </Button>
        {PAPER_KINDS.map((k) => (
          <Button
            key={k.value}
            size="sm"
            variant={kindFilter === k.value ? "default" : "outline"}
            onClick={() => setKindFilter(k.value)}
          >
            {k.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{editingPaper ? "Sửa đề" : "Tạo đề mới"}</CardTitle>
          </CardHeader>
          <CardContent>
            <PaperForm
              key={editingPaper?.id ?? "create"}
              paper={editingPaper ?? undefined}
              loading={loading}
              setLoading={setLoading}
              onDone={() => {
                setEditingPaper(null);
                router.refresh();
              }}
            />
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
                    [{formatPaperKind(p.paperKind)}] {p.title} ({p.questions.length} câu)
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
          <CardTitle>Danh sách đề ({filteredPapers.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredPapers.map((paper) => (
            <div key={paper.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{paper.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPaperKind(paper.paperKind)} · {formatExamLevel(paper.level)} ·{" "}
                    {formatSkill(paper.skill)} · {paper.questions.length} câu
                    {paper.timeLimit ? ` · ${Math.round(paper.timeLimit / 60)} phút` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{formatPaperKind(paper.paperKind)}</Badge>
                  {paper.isMockTest && <Badge>Mock</Badge>}
                  <Badge variant={paper.published ? "success" : "outline"}>
                    {paper.published ? "Published" : "Draft"}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => setEditingPaper(paper)}>
                    <Pencil className="mr-1 h-3 w-3" />
                    Sửa
                  </Button>
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
                <ol className="mt-3 space-y-2 text-sm">
                  {paper.questions.map((pq, i) => (
                    <li key={pq.id}>
                      <div className="flex items-center justify-between rounded bg-slate-50 px-2 py-1">
                        <span>
                          {i + 1}. {pq.question.title ?? pq.question.type}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="p-1 text-purple-600 hover:bg-purple-100 rounded"
                            title="Sửa nội dung câu"
                            disabled={loadingQuestionId === pq.question.id}
                            onClick={() => openQuestionEdit(pq.question.id)}
                          >
                            {loadingQuestionId === pq.question.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Pencil className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            className="p-1 text-purple-600 hover:bg-purple-100 rounded"
                            onClick={async () => {
                              await movePaperQuestionAction(pq.id, "up");
                              router.refresh();
                            }}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="p-1 text-purple-600 hover:bg-purple-100 rounded"
                            onClick={async () => {
                              await movePaperQuestionAction(pq.id, "down");
                              router.refresh();
                            }}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="px-2 text-red-600 hover:underline"
                            onClick={async () => {
                              await removeQuestionFromPaperAction(pq.id);
                              toast.success("Đã gỡ câu");
                              router.refresh();
                            }}
                          >
                            Gỡ
                          </button>
                        </div>
                      </div>
                      {editingQuestion?.id === pq.question.id && (
                        <div className="mt-2 rounded-lg border border-purple-200 bg-white p-3">
                          <p className="mb-2 text-xs font-semibold text-purple-700">
                            Sửa câu {i + 1} · {paper.title}
                          </p>
                          {loadingQuestionId === pq.question.id ? (
                            <p className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Đang tải nội dung...
                            </p>
                          ) : (
                            <QuestionForm
                              key={editingQuestion.id}
                              question={editingQuestion}
                              mode="edit"
                              compact
                              onDone={() => {
                                setEditingQuestion(null);
                                router.refresh();
                              }}
                            />
                          )}
                        </div>
                      )}
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
