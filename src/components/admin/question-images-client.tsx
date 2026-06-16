"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AdminNav } from "@/components/admin/admin-nav";
import { formatExamLevel, formatSkill } from "@/lib/constants";
import { getQuestionByIdAction } from "@/lib/actions/exam";
import {
  QuestionForm,
  type QuestionFormData,
} from "@/components/admin/question-form";
import type { AdminPermission } from "@/lib/admin/permissions";
import type { QuestionImageStatus } from "@/lib/exam/question-image-needs";

export type QuestionImageAuditItem = {
  id: string;
  type: string;
  level: string;
  skill: string;
  title: string | null;
  imageStatus: QuestionImageStatus;
  imageHint: string | null;
  imageUrl: string | null;
};

type FilterTab = "missing" | "complete" | "all_needs";

const PAGE_SIZE = 40;

export function QuestionImagesClient({
  items,
  summary,
  permissions,
}: {
  items: QuestionImageAuditItem[];
  summary: { needsImage: number; missing: number; complete: number };
  permissions: AdminPermission[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<FilterTab>("missing");
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<QuestionFormData | null>(null);
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (tab === "missing" && item.imageStatus !== "missing") return false;
      if (tab === "complete" && item.imageStatus !== "complete") return false;
      if (levelFilter !== "ALL" && item.level !== levelFilter) return false;
      if (!q) return true;
      return (
        item.title?.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.imageHint?.toLowerCase().includes(q) ||
        item.skill.toLowerCase().includes(q)
      );
    });
  }, [items, tab, search, levelFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  async function handleEdit(id: string) {
    setLoadingEditId(id);
    const result = await getQuestionByIdAction(id);
    setLoadingEditId(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setEditing(result.question);
  }

  function handleDone() {
    setEditing(null);
    router.refresh();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Câu hỏi cần ảnh</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/questions">← Quản lý câu hỏi</Link>
        </Button>
      </div>
      <AdminNav currentPath="/admin/question-images" permissions={permissions} />

      <div className="mb-6 grid gap-3 rounded-2xl border-2 border-sky-100 bg-sky-50/60 p-4 sm:grid-cols-3">
        <div>
          <p className="text-sm font-extrabold text-sky-900">Cần ảnh</p>
          <p className="text-2xl font-bold">{summary.needsImage}</p>
        </div>
        <div>
          <p className="text-sm font-extrabold text-amber-800">Thiếu ảnh</p>
          <p className="text-2xl font-bold text-amber-700">{summary.missing}</p>
        </div>
        <div>
          <p className="text-sm font-extrabold text-emerald-800">Đã có ảnh</p>
          <p className="text-2xl font-bold text-emerald-700">{summary.complete}</p>
        </div>
      </div>

      {editing && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <QuestionForm question={editing} mode="edit" onDone={handleDone} compact />
          </CardContent>
        </Card>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["missing", `Thiếu ảnh (${summary.missing})`],
            ["complete", `Đã có ảnh (${summary.complete})`],
            ["all_needs", `Tất cả cần ảnh (${summary.needsImage})`],
          ] as const
        ).map(([key, label]) => (
          <Button
            key={key}
            size="sm"
            variant={tab === key ? "default" : "outline"}
            onClick={() => {
              setTab(key);
              setPage(0);
            }}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          placeholder="Tìm tiêu đề, ID, mô tả ảnh..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="max-w-sm"
        />
        <select
          value={levelFilter}
          onChange={(e) => {
            setLevelFilter(e.target.value);
            setPage(0);
          }}
          className="h-10 rounded-md border px-3 text-sm"
        >
          <option value="ALL">Tất cả level</option>
          {["STARTERS", "MOVERS", "FLYERS", "KET", "PET", "FCE"].map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      <p className="mb-3 text-sm text-muted-foreground">
        Hiển thị {filtered.length === 0 ? 0 : page * PAGE_SIZE + 1}–
        {Math.min((page + 1) * PAGE_SIZE, filtered.length)} / {filtered.length} câu
      </p>

      <div className="space-y-3">
        {pageItems.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2">
                  <Badge variant={item.imageStatus === "missing" ? "danger" : "secondary"}>
                    {item.imageStatus === "missing" ? "Thiếu ảnh" : "Đã có ảnh"}
                  </Badge>
                  <Badge variant="outline">{formatExamLevel(item.level)}</Badge>
                  <Badge variant="outline">{formatSkill(item.skill)}</Badge>
                  <Badge>{item.type}</Badge>
                </div>
                <p className="mt-2 font-medium">{item.title ?? "Không có tiêu đề"}</p>
                {item.imageHint && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    <span className="font-semibold">Gợi ý ảnh: </span>
                    {item.imageHint}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">{item.id}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={loadingEditId === item.id}
                onClick={() => handleEdit(item.id)}
              >
                {loadingEditId === item.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Pencil className="mr-1 h-4 w-4" />
                )}
                Upload ảnh
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Không có câu nào trong bộ lọc này.
        </p>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Trước
          </Button>
          <span className="text-sm">
            Trang {page + 1}/{totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}
