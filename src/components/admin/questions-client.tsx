"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AdminNav } from "@/components/admin/admin-nav";
import { EXAM_LEVELS, SKILLS, QUESTION_TYPES, formatExamLevel, formatSkill } from "@/lib/constants";
import {
  createQuestionAction,
  deleteQuestionAction,
  updateQuestionAction,
} from "@/lib/actions/exam";
import { Pencil, Trash2 } from "lucide-react";

interface QuestionItem {
  id: string;
  type: string;
  level: string;
  skill: string;
  title: string | null;
  points: number;
  content: unknown;
  correctAnswer: unknown;
  audioUrl: string | null;
}

const defaultContent: Record<string, string> = {
  MCQ: JSON.stringify(
    {
      passage: "Tom likes playing football every weekend.",
      question: "What does Tom like?",
      options: ["Swimming", "Football", "Reading", "Music"],
    },
    null,
    2
  ),
  GAP_FILL: JSON.stringify(
    { passage: "My name ___ Anna. I am ten years old.", blanks: 1 },
    null,
    2
  ),
  FREE_TEXT: JSON.stringify(
    {
      taskPrompt: "Write an email to your friend about your weekend. Write 25-35 words.",
      wordLimit: 35,
      instructions: "Use past tense.",
    },
    null,
    2
  ),
  SPEAKING_PROMPT: JSON.stringify(
    { prompt: "Describe your favourite hobby. Speak for 1 minute.", speakingTime: 60 },
    null,
    2
  ),
};

function formatJson(value: unknown): string {
  if (value === null || value === undefined) return "";
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

export function AdminQuestionsClient({ questions }: { questions: QuestionItem[] }) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("MCQ");
  const [level, setLevel] = useState("KET");
  const [skill, setSkill] = useState("READING");
  const [editing, setEditing] = useState<QuestionItem | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    if (!editing) {
      formData.set("type", type);
      formData.set("level", level);
      formData.set("skill", skill);
    }
    if (editing) formData.set("id", editing.id);

    const result = editing
      ? await updateQuestionAction(formData)
      : await createQuestionAction(formData);

    setLoading(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success(editing ? "Đã cập nhật" : "Đã tạo câu hỏi");
      if (!editing) e.currentTarget.reset();
      setEditing(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa câu hỏi này?")) return;
    const result = await deleteQuestionAction(id);
    if (result.error) toast.error(result.error);
    else toast.success("Đã xóa");
  }

  const formType = editing?.type ?? type;
  const formLevel = editing?.level ?? level;
  const formSkill = editing?.skill ?? skill;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold">Quản lý câu hỏi</h1>
      <AdminNav currentPath="/admin/questions" />

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{editing ? "Sửa câu hỏi" : "Thêm câu hỏi mới"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form key={editing?.id ?? "create"} onSubmit={handleSubmit} className="space-y-4">
              {!editing && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Loại</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {QUESTION_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Cấp độ</Label>
                    <Select value={level} onValueChange={setLevel}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {EXAM_LEVELS.map((l) => (
                          <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              {editing && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Loại</Label>
                    <select name="type" defaultValue={editing.type} className="mt-1 flex h-10 w-full rounded-md border px-3 text-sm">
                      {QUESTION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Cấp độ</Label>
                    <select name="level" defaultValue={editing.level} className="mt-1 flex h-10 w-full rounded-md border px-3 text-sm">
                      {EXAM_LEVELS.map((l) => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              <div>
                <Label>Kỹ năng</Label>
                {editing ? (
                  <select name="skill" defaultValue={editing.skill} className="mt-1 flex h-10 w-full rounded-md border px-3 text-sm">
                    {SKILLS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                ) : (
                  <Select value={skill} onValueChange={setSkill}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SKILLS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div>
                <Label htmlFor="title">Tiêu đề (tuỳ chọn)</Label>
                <Input id="title" name="title" defaultValue={editing?.title ?? ""} />
              </div>
              <div>
                <Label htmlFor="content">Content (JSON)</Label>
                <Textarea
                  id="content"
                  name="content"
                  rows={8}
                  defaultValue={editing ? formatJson(editing.content) : defaultContent[formType]}
                  required
                />
              </div>
              <div>
                <Label htmlFor="correctAnswer">Đáp án đúng (JSON, tuỳ chọn)</Label>
                <Input
                  id="correctAnswer"
                  name="correctAnswer"
                  defaultValue={editing ? formatJson(editing.correctAnswer) : ""}
                  placeholder='"Football" hoặc ["word1"]'
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="points">Điểm</Label>
                  <Input id="points" name="points" type="number" defaultValue={editing?.points ?? 1} />
                </div>
                <div>
                  <Label htmlFor="audioUrl">Audio URL (Listening)</Label>
                  <Input id="audioUrl" name="audioUrl" defaultValue={editing?.audioUrl ?? ""} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Tạo câu hỏi"}
                </Button>
                {editing && (
                  <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                    Huỷ
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Danh sách ({questions.length})</h2>
          {questions.map((q) => (
            <Card key={q.id}>
              <CardContent className="flex items-start justify-between gap-4 pt-4">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{q.type}</Badge>
                    <Badge variant="secondary">{formatExamLevel(q.level)}</Badge>
                    <Badge variant="outline">{formatSkill(q.skill)}</Badge>
                  </div>
                  <p className="mt-2 text-sm font-medium">{q.title ?? "Không có tiêu đề"}</p>
                  <p className="text-xs text-muted-foreground">{q.points} điểm · {q.id.slice(0, 8)}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => setEditing(q)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(q.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
