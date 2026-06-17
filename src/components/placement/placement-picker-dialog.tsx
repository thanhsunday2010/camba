"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  groupPlacementPapersByCategory,
  PLACEMENT_CATEGORIES,
  PLACEMENT_CATEGORY_ORDER,
  type PlacementCategoryId,
  type PlacementPaperListItem,
} from "@/lib/placement/categories";
import { getPlacementPaperLabel } from "@/lib/placement/picker-options";
import { usePlacementStart } from "@/components/placement/use-placement-start";
import type { PlacementUsageSnapshot } from "@/components/placement/placement-picker-provider";

interface PlacementPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  papers: PlacementPaperListItem[];
  placementUsage: PlacementUsageSnapshot;
}

export function PlacementPickerDialog({
  open,
  onOpenChange,
  papers,
  placementUsage,
}: PlacementPickerDialogProps) {
  const { startPlacement, loading, isLoggedIn } = usePlacementStart();
  const [categoryId, setCategoryId] = useState<PlacementCategoryId | "">("");
  const [paperId, setPaperId] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const grouped = useMemo(() => groupPlacementPapersByCategory(papers), [papers]);

  const availableCategories = useMemo(
    () => PLACEMENT_CATEGORY_ORDER.filter((id) => grouped[id].length > 0),
    [grouped]
  );

  const categoryPapers = categoryId ? grouped[categoryId] : [];

  const selectedPaper = categoryPapers.find((p) => p.id === paperId);

  useEffect(() => {
    if (!open) return;
    setCategoryId(availableCategories[0] ?? "");
    setPaperId("");
    setFullName("");
    setPhone("");
    // Reset form only when dialog opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!categoryId) {
      setPaperId("");
      return;
    }
    const list = grouped[categoryId];
    if (list.length === 1) {
      setPaperId(list[0].id);
    } else {
      setPaperId("");
    }
  }, [categoryId, grouped]);

  const guestValid = fullName.trim().length >= 2 && phone.length === 10;
  const outOfQuota =
    isLoggedIn &&
    placementUsage != null &&
    !placementUsage.unlimited &&
    placementUsage.remaining === 0;

  const canStart = !!paperId && (isLoggedIn ? !outOfQuota : guestValid);

  async function handleStart() {
    if (!paperId || !canStart) return;
    const guest = isLoggedIn ? undefined : { fullName: fullName.trim(), phone };
    const res = await startPlacement(paperId, guest);
    if (res.ok) {
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>🎯 Test trình độ</DialogTitle>
          <DialogDescription>
            Chọn chương trình và loại đề — sau đó bắt đầu làm bài ngay.
          </DialogDescription>
        </DialogHeader>

        {papers.length === 0 ? (
          <p className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/80 p-4 text-sm font-semibold text-amber-900">
            Chưa có đề placement trên hệ thống. Liên hệ quản trị viên.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="placement-category">Chương trình / môn học</Label>
              <Select
                value={categoryId}
                onValueChange={(v) => setCategoryId(v as PlacementCategoryId)}
              >
                <SelectTrigger id="placement-category" className="rounded-xl border-2">
                  <SelectValue placeholder="Chọn chương trình" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((id) => (
                    <SelectItem key={id} value={id}>
                      {PLACEMENT_CATEGORIES[id].title.replace(" Placement Test", "")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {categoryId && (
                <p className="text-xs font-medium text-muted-foreground">
                  {PLACEMENT_CATEGORIES[categoryId].description}
                </p>
              )}
            </div>

            {categoryId && categoryPapers.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="placement-paper">Loại đề / cấp độ</Label>
                <Select value={paperId} onValueChange={setPaperId}>
                  <SelectTrigger id="placement-paper" className="rounded-xl border-2">
                    <SelectValue placeholder="Chọn loại đề" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryPapers.map((paper) => (
                      <SelectItem key={paper.id} value={paper.id}>
                        {getPlacementPaperLabel(paper)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedPaper?.timeLimit && (
              <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Clock className="h-4 w-4" />
                Thời gian làm bài: {Math.floor(selectedPaper.timeLimit / 60)} phút
              </p>
            )}

            {isLoggedIn ? (
              <>
                {placementUsage && !placementUsage.unlimited && placementUsage.limit != null && (
                  <p className="rounded-xl border-2 border-sky-100 bg-sky-50/80 px-3 py-2 text-sm font-semibold text-sky-900">
                    Tuần này còn{" "}
                    <strong>
                      {placementUsage.remaining}/{placementUsage.limit}
                    </strong>{" "}
                    lượt placement (gói {placementUsage.planName}).
                  </p>
                )}
                {outOfQuota && (
                  <p className="text-sm font-semibold text-rose-700">
                    Đã hết lượt placement tuần này — thử lại từ thứ Hai tuần sau.
                  </p>
                )}
              </>
            ) : (
              <div className="space-y-3 rounded-xl border-2 border-purple-100 bg-purple-50/50 p-4">
                <p className="text-sm font-bold text-purple-900">
                  Thông tin khách (không cần đăng ký)
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  Khách: <strong>1 lượt placement/tháng</strong> theo SĐT (mọi loại đề).
                </p>
                <div>
                  <Label htmlFor="placement-guest-name">Họ tên *</Label>
                  <Input
                    id="placement-guest-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="mt-1 rounded-xl border-2"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <Label htmlFor="placement-guest-phone">Số điện thoại *</Label>
                  <Input
                    id="placement-guest-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="0912345678"
                    inputMode="numeric"
                    className="mt-1 rounded-xl border-2"
                    autoComplete="tel"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Đúng 10 chữ số</p>
                </div>
                <p className="text-center text-xs font-medium text-muted-foreground">
                  <a href="/login" className="font-bold text-purple-600 underline">
                    Đăng nhập
                  </a>{" "}
                  để làm thêm (2 lượt/tuần).
                </p>
              </div>
            )}

            <Button
              className="w-full kid-btn-fun"
              disabled={!canStart || loading}
              onClick={() => void handleStart()}
            >
              {loading ? "Đang mở..." : "Bắt đầu làm bài"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
