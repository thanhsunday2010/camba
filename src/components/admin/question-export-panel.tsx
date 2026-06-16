"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EXAM_LEVELS, SKILLS } from "@/lib/constants";

type PoolFilter = "practice" | "placement" | "all";

function parseFilename(contentDisposition: string | null): string | null {
  if (!contentDisposition) return null;
  const match = /filename="([^"]+)"/.exec(contentDisposition);
  return match?.[1] ?? null;
}

export function QuestionExportPanel() {
  const [level, setLevel] = useState<string>("all");
  const [skill, setSkill] = useState<string>("all");
  const [pool, setPool] = useState<PoolFilter>("practice");
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const params = new URLSearchParams({ level, skill, pool });
      const res = await fetch(`/api/admin/questions/export?${params.toString()}`);

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(err.error ?? "Không thể export câu hỏi");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download =
        parseFilename(res.headers.get("Content-Disposition")) ?? "camba-questions.json";
      anchor.click();
      URL.revokeObjectURL(url);

      toast.success("Đã tải file JSON câu hỏi");
    } catch {
      toast.error("Không thể export câu hỏi");
    } finally {
      setExporting(false);
    }
  }

  return (
    <Card className="mb-6 border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Download className="h-5 w-5 text-emerald-700" />
          Export câu hỏi
        </CardTitle>
        <CardDescription>
          Tải ngân hàng câu hỏi ra file JSON (level, skill, nội dung, đáp án, audio URL).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="grid min-w-[140px] flex-1 gap-1.5">
          <Label htmlFor="export-level">Level</Label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger id="export-level">
              <SelectValue placeholder="Tất cả level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả level</SelectItem>
              {EXAM_LEVELS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid min-w-[140px] flex-1 gap-1.5">
          <Label htmlFor="export-skill">Kỹ năng</Label>
          <Select value={skill} onValueChange={setSkill}>
            <SelectTrigger id="export-skill">
              <SelectValue placeholder="Tất cả kỹ năng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả kỹ năng</SelectItem>
              {SKILLS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid min-w-[160px] flex-1 gap-1.5">
          <Label htmlFor="export-pool">Nguồn</Label>
          <Select value={pool} onValueChange={(v) => setPool(v as PoolFilter)}>
            <SelectTrigger id="export-pool">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="practice">Luyện / mock (mặc định)</SelectItem>
              <SelectItem value="placement">Placement test</SelectItem>
              <SelectItem value="all">Tất cả</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          className="sm:mb-0.5"
          disabled={exporting}
          onClick={() => void handleExport()}
        >
          {exporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang export...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Tải JSON
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
