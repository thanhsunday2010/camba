"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Save, X } from "lucide-react";
import { useInlineEdit } from "@/components/inline-edit/inline-edit-provider";

export function InlineEditToolbar() {
  const ctx = useInlineEdit();
  if (!ctx?.canEdit) return null;

  if (!ctx.editMode) {
    return (
      <button
        type="button"
        onClick={ctx.enterEditMode}
        className="fixed bottom-5 right-5 z-[90] flex items-center gap-2 rounded-full border-2 border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-950 shadow-lg transition hover:scale-105 hover:bg-amber-100"
        aria-label="Chỉnh sửa nội dung trang"
      >
        <Pencil className="h-4 w-4" />
        Chỉnh sửa trang
      </button>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] border-t-2 border-amber-300 bg-amber-50/95 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold text-amber-950">✏️ Chế độ chỉnh sửa (Super Admin)</p>
          <p className="text-xs font-medium text-amber-900/80">
            Bấm vào vùng có viền vàng để sửa · {ctx.dirtyCount} thay đổi chưa lưu
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-amber-300"
            disabled={ctx.saving}
            onClick={ctx.cancel}
          >
            <X className="mr-1.5 h-4 w-4" />
            Hủy
          </Button>
          <Button
            type="button"
            className="kid-btn-fun rounded-full bg-amber-600 hover:bg-amber-700"
            disabled={ctx.saving || ctx.dirtyCount === 0}
            onClick={() => void ctx.save()}
          >
            <Save className="mr-1.5 h-4 w-4" />
            {ctx.saving ? "Đang lưu..." : `Lưu${ctx.dirtyCount > 0 ? ` (${ctx.dirtyCount})` : ""}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
