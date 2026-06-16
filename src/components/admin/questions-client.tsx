"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AdminNav } from "@/components/admin/admin-nav";
import { formatExamLevel, formatSkill } from "@/lib/constants";
import { deleteQuestionAction, getQuestionByIdAction } from "@/lib/actions/exam";
import {
  QuestionForm,
  type QuestionFormData,
  type QuestionListItem,
} from "@/components/admin/question-form";
import { Loader2, Pencil, Trash2 } from "lucide-react";

import type { AdminPermission } from "@/lib/admin/permissions";

export function AdminQuestionsClient({
  questions,
  permissions,
}: {
  questions: QuestionListItem[];
  permissions: AdminPermission[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<QuestionFormData | null>(null);
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return questions;
    return questions.filter(
      (item) =>
        item.title?.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.level.toLowerCase().includes(q) ||
        item.skill.toLowerCase().includes(q)
    );
  }, [questions, search]);

  async function handleEdit(item: QuestionListItem) {
    if (editing?.id === item.id) {
      setEditing(null);
      return;
    }
    setLoadingEditId(item.id);
    const result = await getQuestionByIdAction(item.id);
    setLoadingEditId(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setEditing(result.question);
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa câu hỏi này?")) return;
    const result = await deleteQuestionAction(id);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Đã xóa");
      if (editing?.id === id) setEditing(null);
      router.refresh();
    }
  }

  function handleDone() {
    setEditing(null);
    router.refresh();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold">Quản lý câu hỏi</h1>
      <div className="mb-4">
        <Link
          href="/admin/question-images"
          className="text-sm font-semibold text-sky-700 hover:underline"
        >
          🖼️ Xem câu hỏi cần bổ sung ảnh →
        </Link>
      </div>
      <AdminNav currentPath="/admin/questions" permissions={permissions} />

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{editing ? "Sửa câu hỏi" : "Thêm câu hỏi mới"}</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingEditId ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tải nội dung câu hỏi...
              </p>
            ) : (
              <QuestionForm
                key={editing?.id ?? "create"}
                question={editing ?? undefined}
                mode={editing ? "edit" : "create"}
                onDone={handleDone}
              />
            )}
          </CardContent>
        </Card>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-semibold">Danh sách ({filtered.length})</h2>
            <Input
              placeholder="Tìm theo tiêu đề, ID, loại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>
          {filtered.map((q) => (
            <Card key={q.id}>
              <CardContent className="flex items-start justify-between gap-4 pt-4">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{q.type}</Badge>
                    <Badge variant="secondary">{formatExamLevel(q.level)}</Badge>
                    <Badge variant="outline">{formatSkill(q.skill)}</Badge>
                  </div>
                  <p className="mt-2 text-sm font-medium">{q.title ?? "Không có tiêu đề"}</p>
                  <p className="text-xs text-muted-foreground">
                    {q.points} điểm · {q.id.slice(0, 8)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={loadingEditId === q.id}
                    onClick={() => handleEdit(q)}
                  >
                    {loadingEditId === q.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Pencil className="h-4 w-4" />
                    )}
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
