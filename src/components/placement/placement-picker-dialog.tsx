"use client";

import Link from "next/link";
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
import { resolvePlacementSlug } from "@/lib/placement/placement-config";
import {
  buildPlacementAuthCallbackUrl,
  buildPlacementPageUrl,
  presetFromPaperSelection,
  type PlacementPickerPreset,
} from "@/lib/placement/picker-url";
import { resolvePresetSelection } from "@/lib/placement/resolve-preset-selection";
import { PlacementShareLink } from "@/components/placement/placement-share-link";
import { usePlacementStart } from "@/components/placement/use-placement-start";
import type { PlacementUsageSnapshot } from "@/components/placement/placement-picker-provider";

interface PlacementPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  papers: PlacementPaperListItem[];
  placementUsage: PlacementUsageSnapshot;
  pendingPreset?: PlacementPickerPreset;
  initialIsLoggedIn: boolean;
}

export function PlacementPickerDialog({
  open,
  onOpenChange,
  papers,
  placementUsage,
  pendingPreset,
  initialIsLoggedIn,
}: PlacementPickerDialogProps) {
  const { startPlacement, loading, isLoggedIn, sessionPending } =
    usePlacementStart(initialIsLoggedIn);
  const [categoryId, setCategoryId] = useState<PlacementCategoryId | "">("");
  const [paperId, setPaperId] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const grouped = useMemo(() => groupPlacementPapersByCategory(papers), [papers]);

  const availableCategories = useMemo(
    () => PLACEMENT_CATEGORY_ORDER.filter((id) => grouped[id].length > 0),
    [grouped]
  );

  const categoryPapers = useMemo(
    () => (categoryId ? grouped[categoryId] : []),
    [categoryId, grouped]
  );
  const selectedPaper = categoryPapers.find((p) => p.id === paperId);

  const sharePreset = useMemo(
    () =>
      presetFromPaperSelection(categoryId, selectedPaper, (paper) =>
        resolvePlacementSlug(paper)
      ),
    [categoryId, selectedPaper]
  );

  useEffect(() => {
    if (!open) return;

    const resolved = resolvePresetSelection(papers, pendingPreset);
    const defaultCategory = availableCategories[0] ?? "";

    if (resolved.categoryId && availableCategories.includes(resolved.categoryId)) {
      setCategoryId(resolved.categoryId);
      const list = grouped[resolved.categoryId];
      if (resolved.paperId && list.some((p) => p.id === resolved.paperId)) {
        setPaperId(resolved.paperId);
      } else if (list.length === 1) {
        setPaperId(list[0].id);
      } else {
        setPaperId("");
      }
    } else {
      setCategoryId(defaultCategory);
      const list = defaultCategory ? grouped[defaultCategory] : [];
      setPaperId(list.length === 1 ? list[0].id : "");
    }

    if (!initialIsLoggedIn) {
      setFullName("");
      setPhone("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pendingPreset, papers]);

  useEffect(() => {
    if (!categoryId) {
      setPaperId("");
      return;
    }
    const list = grouped[categoryId];
    setPaperId((current) => {
      if (current && list.some((p) => p.id === current)) return current;
      if (list.length === 1) return list[0].id;
      return "";
    });
  }, [categoryId, grouped]);

  useEffect(() => {
    if (!open) return;
    const preset = presetFromPaperSelection(
      categoryId,
      selectedPaper ?? (paperId ? categoryPapers.find((p) => p.id === paperId) : undefined),
      (paper) => resolvePlacementSlug(paper)
    );
    const next = buildPlacementPageUrl(preset);
    window.history.replaceState(null, "", next);
  }, [open, categoryId, paperId, selectedPaper, categoryPapers]);

  const guestValid = fullName.trim().length >= 2 && phone.length === 10;
  const outOfQuota =
    isLoggedIn &&
    placementUsage != null &&
    !placementUsage.unlimited &&
    placementUsage.remaining === 0;

  const canStart =
    !!paperId &&
    !sessionPending &&
    (isLoggedIn ? !outOfQuota : guestValid);

  const authCallbackUrl = buildPlacementAuthCallbackUrl(sharePreset);

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
      <DialogContent
        className="
          max-h-[88dvh] w-[calc(100%-0.75rem)] max-w-lg gap-3 overflow-y-auto p-3 pt-7
          sm:gap-4 sm:p-6 sm:pt-6
          max-sm:bottom-0 max-sm:left-0 max-sm:top-auto max-sm:translate-x-0 max-sm:translate-y-0
          max-sm:rounded-b-none max-sm:rounded-t-2xl
          max-sm:data-[state=closed]:slide-out-to-bottom
          max-sm:data-[state=open]:slide-in-from-bottom
        "
      >
        <DialogHeader className="space-y-0.5 sm:space-y-1.5">
          <DialogTitle className="text-base sm:text-lg">🎯 Test trình độ</DialogTitle>
          <DialogDescription className="text-xs leading-snug sm:text-sm">
            Chọn chương trình và loại đề — sau đó bắt đầu hoặc chia sẻ link.
          </DialogDescription>
        </DialogHeader>

        {papers.length === 0 ? (
          <p className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/80 p-3 text-xs font-semibold text-amber-900 sm:p-4 sm:text-sm">
            Chưa có đề placement trên hệ thống. Liên hệ quản trị viên.
          </p>
        ) : (
          <div className="space-y-2.5 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="placement-category" className="text-xs sm:text-sm">
                Chương trình / môn học
              </Label>
              <Select
                value={categoryId}
                onValueChange={(v) => setCategoryId(v as PlacementCategoryId)}
              >
                <SelectTrigger
                  id="placement-category"
                  className="h-9 rounded-xl border-2 text-sm sm:h-10"
                >
                  <SelectValue placeholder="Chọn chương trình" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((id) => (
                    <SelectItem key={id} value={id}>
                      {PLACEMENT_CATEGORIES[id].menuLabel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {categoryId && (
                <p className="hidden text-xs font-medium text-muted-foreground sm:block">
                  {PLACEMENT_CATEGORIES[categoryId].description}
                </p>
              )}
            </div>

            {categoryId && categoryPapers.length > 0 && (
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="placement-paper" className="text-xs sm:text-sm">
                  Loại đề / cấp độ
                </Label>
                <Select value={paperId} onValueChange={setPaperId}>
                  <SelectTrigger
                    id="placement-paper"
                    className="h-9 rounded-xl border-2 text-sm sm:h-10"
                  >
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
              <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground sm:gap-2 sm:text-sm">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {Math.floor(selectedPaper.timeLimit / 60)} phút
              </p>
            )}

            {paperId && sharePreset && (
              <PlacementShareLink
                preset={sharePreset}
                label={selectedPaper ? getPlacementPaperLabel(selectedPaper) : undefined}
              />
            )}

            {sessionPending ? (
              <p className="rounded-xl border-2 border-purple-100 bg-purple-50/50 px-2.5 py-2 text-xs font-medium text-muted-foreground sm:px-3 sm:text-sm">
                Đang kiểm tra phiên đăng nhập…
              </p>
            ) : isLoggedIn ? (
              <>
                {placementUsage && !placementUsage.unlimited && placementUsage.limit != null && (
                  <p className="rounded-xl border-2 border-sky-100 bg-sky-50/80 px-2.5 py-2 text-xs font-semibold text-sky-900 sm:px-3 sm:text-sm">
                    Tuần này còn{" "}
                    <strong>
                      {placementUsage.remaining}/{placementUsage.limit}
                    </strong>{" "}
                    lượt (gói {placementUsage.planName}).
                  </p>
                )}
                {outOfQuota && (
                  <p className="text-xs font-semibold text-rose-700 sm:text-sm">
                    Đã hết lượt tuần này — thử lại từ thứ Hai.
                  </p>
                )}
              </>
            ) : (
              <div className="space-y-2 rounded-xl border-2 border-purple-100 bg-purple-50/50 p-2.5 sm:space-y-3 sm:p-4">
                <p className="text-xs font-bold text-purple-900 sm:text-sm">
                  Khách (không cần đăng ký)
                </p>
                <p className="text-[11px] font-medium text-muted-foreground sm:text-xs">
                  1 lượt/tháng theo SĐT. Bài dở tiếp tục khi nhập lại cùng SĐT.
                </p>
                <div>
                  <Label htmlFor="placement-guest-name" className="text-xs sm:text-sm">
                    Họ tên *
                  </Label>
                  <Input
                    id="placement-guest-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="mt-1 h-9 rounded-xl border-2 text-sm sm:h-10"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <Label htmlFor="placement-guest-phone" className="text-xs sm:text-sm">
                    Số điện thoại *
                  </Label>
                  <Input
                    id="placement-guest-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="0912345678"
                    inputMode="numeric"
                    className="mt-1 h-9 rounded-xl border-2 text-sm sm:h-10"
                    autoComplete="tel"
                  />
                </div>
                <p className="text-center text-[11px] font-medium text-muted-foreground sm:text-xs">
                  <Link
                    href={`/login?callbackUrl=${encodeURIComponent(authCallbackUrl)}`}
                    className="font-bold text-purple-600 underline"
                  >
                    Đăng nhập
                  </Link>{" "}
                  /{" "}
                  <Link
                    href={`/register?callbackUrl=${encodeURIComponent(authCallbackUrl)}`}
                    className="font-bold text-purple-600 underline"
                  >
                    Đăng ký
                  </Link>{" "}
                  — giữ đề đã chọn.
                </p>
              </div>
            )}

            <Button
              className="h-10 w-full kid-btn-fun text-sm sm:h-11 sm:text-base"
              disabled={!canStart || loading}
              onClick={() => void handleStart()}
            >
              {loading
                ? "Đang mở..."
                : sessionPending
                  ? "Đang kiểm tra..."
                  : "Bắt đầu làm bài"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
