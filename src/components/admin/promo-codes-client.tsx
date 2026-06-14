"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  deletePromoCodeAction,
  upsertPromoCodeAction,
} from "@/lib/actions/promo";
import { DEFAULT_PROMO_MAX_REDEMPTIONS } from "@/lib/promo/constants";
import { describePromoBenefit } from "@/lib/promo/labels";
import type { BillingCycle, PromoBenefitType, PromoCode, SubscriptionPlan } from "@prisma/client";
import { Plus, Pencil, Trash2 } from "lucide-react";

type PromoRow = PromoCode & {
  _count: { redemptions: number };
  redemptions: {
    id: string;
    redeemedAt: Date;
    user: { name: string | null; email: string | null; phone: string | null };
  }[];
};

interface PromoCodesClientProps {
  initialCodes: PromoRow[];
}

function redemptionUsed(row: PromoRow): number {
  return Math.max(row.redemptionCount, row._count.redemptions);
}

function usagePercent(used: number, max: number | null): number {
  if (!max || max <= 0) return 0;
  return Math.min(100, Math.round((used / max) * 100));
}

const emptyForm = {
  id: "",
  code: "",
  description: "",
  plan: "PRO" as SubscriptionPlan,
  billingCycle: "MONTHLY" as BillingCycle,
  benefitType: "FREE_PERIOD" as PromoBenefitType,
  discountPercent: "",
  discountAmount: "",
  maxRedemptions: "300",
  active: true,
  showInPopup: true,
  popupTitle: "",
  popupMessage: "",
  startsAt: "",
  expiresAt: "",
};

export function PromoCodesClient({ initialCodes }: PromoCodesClientProps) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);

  function startCreate() {
    setForm(emptyForm);
    setEditing(true);
  }

  function startEdit(row: PromoRow) {
    setForm({
      id: row.id,
      code: row.code,
      description: row.description ?? "",
      plan: row.plan,
      billingCycle: row.billingCycle,
      benefitType: row.benefitType,
      discountPercent: row.discountPercent?.toString() ?? "",
      discountAmount: row.discountAmount?.toString() ?? "",
      maxRedemptions: row.maxRedemptions?.toString() ?? String(DEFAULT_PROMO_MAX_REDEMPTIONS),
      active: row.active,
      showInPopup: row.showInPopup,
      popupTitle: row.popupTitle ?? "",
      popupMessage: row.popupMessage ?? "",
      startsAt: row.startsAt ? new Date(row.startsAt).toISOString().slice(0, 16) : "",
      expiresAt: row.expiresAt ? new Date(row.expiresAt).toISOString().slice(0, 16) : "",
    });
    setEditing(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (typeof value === "boolean") {
        fd.set(key, value ? "true" : "false");
      } else if (value !== "") {
        fd.set(key, String(value));
      }
    });
    const res = await upsertPromoCodeAction(fd);
    setPending(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success(form.id ? "Đã cập nhật mã" : "Đã tạo mã mới");
    setEditing(false);
    setForm(emptyForm);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa hoặc vô hiệu hóa mã này?")) return;
    setPending(true);
    const res = await deletePromoCodeAction(id);
    setPending(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("deactivated" in res && res.deactivated ? "Đã vô hiệu hóa mã" : "Đã xóa mã");
    router.refresh();
  }

  const totalUsed = initialCodes.reduce((sum, row) => sum + redemptionUsed(row), 0);
  const activeCodes = initialCodes.filter((row) => row.active).length;
  const exhaustedCodes = initialCodes.filter((row) => {
    const max = row.maxRedemptions;
    return max != null && redemptionUsed(row) >= max;
  }).length;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-2 border-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Mã đang hoạt động</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-purple-700">{activeCodes}</p>
            <p className="text-xs text-muted-foreground">/{initialCodes.length} mã tổng</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Tổng lượt đã dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-purple-700">{totalUsed}</p>
            <p className="text-xs text-muted-foreground">trên tất cả mã</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Mã đã hết lượt</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-amber-700">{exhaustedCodes}</p>
            <p className="text-xs text-muted-foreground">đạt giới hạn tối đa</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Super Admin quản lý mã ưu đãi, quyền lợi và nội dung popup cho user gói Free.
        </p>
        <Button type="button" className="rounded-full" onClick={startCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm mã
        </Button>
      </div>

      {editing && (
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle>{form.id ? "Sửa mã ưu đãi" : "Mã ưu đãi mới"}</CardTitle>
            <CardDescription>Cấu hình quyền lợi và popup thông báo</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">Mã *</Label>
                <Input
                  id="code"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả nội bộ</Label>
                <Input
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan">Gói áp dụng</Label>
                <select
                  id="plan"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.plan}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, plan: e.target.value as SubscriptionPlan }))
                  }
                >
                  <option value="PRO">Pro</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingCycle">Chu kỳ</Label>
                <select
                  id="billingCycle"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.billingCycle}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, billingCycle: e.target.value as BillingCycle }))
                  }
                >
                  <option value="MONTHLY">1 tháng</option>
                  <option value="YEARLY">12 tháng</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="benefitType">Loại ưu đãi</Label>
                <select
                  id="benefitType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.benefitType}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, benefitType: e.target.value as PromoBenefitType }))
                  }
                >
                  <option value="FREE_PERIOD">Miễn phí gói (100%)</option>
                  <option value="PERCENT_OFF">Giảm theo %</option>
                  <option value="FIXED_AMOUNT_OFF">Giảm số tiền cố định</option>
                </select>
              </div>
              {form.benefitType === "PERCENT_OFF" && (
                <div className="space-y-2">
                  <Label htmlFor="discountPercent">% giảm</Label>
                  <Input
                    id="discountPercent"
                    type="number"
                    min={1}
                    max={100}
                    value={form.discountPercent}
                    onChange={(e) => setForm((f) => ({ ...f, discountPercent: e.target.value }))}
                  />
                </div>
              )}
              {form.benefitType === "FIXED_AMOUNT_OFF" && (
                <div className="space-y-2">
                  <Label htmlFor="discountAmount">Số tiền giảm (VND)</Label>
                  <Input
                    id="discountAmount"
                    type="number"
                    min={0}
                    value={form.discountAmount}
                    onChange={(e) => setForm((f) => ({ ...f, discountAmount: e.target.value }))}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="maxRedemptions">Giới hạn lượt dùng (mặc định {DEFAULT_PROMO_MAX_REDEMPTIONS})</Label>
                <Input
                  id="maxRedemptions"
                  type="number"
                  min={1}
                  required
                  value={form.maxRedemptions}
                  onChange={(e) => setForm((f) => ({ ...f, maxRedemptions: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startsAt">Bắt đầu (tùy chọn)</Label>
                <Input
                  id="startsAt"
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiresAt">Hết hạn (tùy chọn)</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  id="active"
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                />
                <Label htmlFor="active">Đang hoạt động</Label>
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  id="showInPopup"
                  type="checkbox"
                  checked={form.showInPopup}
                  onChange={(e) => setForm((f) => ({ ...f, showInPopup: e.target.checked }))}
                />
                <Label htmlFor="showInPopup">Hiện popup cho user gói Free</Label>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="popupTitle">Tiêu đề popup</Label>
                <Input
                  id="popupTitle"
                  value={form.popupTitle}
                  onChange={(e) => setForm((f) => ({ ...f, popupTitle: e.target.value }))}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="popupMessage">Nội dung popup</Label>
                <Textarea
                  id="popupMessage"
                  rows={3}
                  value={form.popupMessage}
                  onChange={(e) => setForm((f) => ({ ...f, popupMessage: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 md:col-span-2">
                <Button type="submit" disabled={pending} className="rounded-full">
                  {pending ? "Đang lưu..." : "Lưu mã"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => {
                    setEditing(false);
                    setForm(emptyForm);
                  }}
                >
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {initialCodes.map((row) => {
          const used = redemptionUsed(row);
          const max = row.maxRedemptions ?? DEFAULT_PROMO_MAX_REDEMPTIONS;
          const pct = usagePercent(used, max);
          const isExhausted = used >= max;
          const remaining = Math.max(0, max - used);

          return (
          <Card key={row.id} className="border-2 border-purple-100">
            <CardContent className="flex flex-wrap items-start justify-between gap-4 p-5">
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xl font-extrabold tracking-wide text-purple-800">
                    {row.code}
                  </span>
                  <Badge variant={row.active && !isExhausted ? "default" : "secondary"}>
                    {!row.active ? "Tắt" : isExhausted ? "Hết lượt" : "Hoạt động"}
                  </Badge>
                  {row.showInPopup && !isExhausted && <Badge variant="outline">Popup</Badge>}
                </div>
                <p className="text-sm font-semibold text-purple-700">{describePromoBenefit(row)}</p>
                {row.description && (
                  <p className="text-sm text-muted-foreground">{row.description}</p>
                )}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-bold text-purple-900">
                      {used} / {max} lượt đã dùng
                    </span>
                    <span className="text-muted-foreground">Còn {remaining} · Mỗi user 1 lần</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <p className="text-xs text-muted-foreground">{pct}% đã sử dụng</p>
                </div>
                {row.redemptions.length > 0 && (
                  <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-3">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-purple-700">
                      Lượt dùng gần đây
                    </p>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {row.redemptions.map((r) => (
                        <li key={r.id}>
                          {r.user.name ?? r.user.email ?? r.user.phone ?? "User"} ·{" "}
                          {new Date(r.redeemedAt).toLocaleString("vi-VN")}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => startEdit(row)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-full text-red-600"
                  disabled={pending}
                  onClick={() => handleDelete(row.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          );
        })}
        {initialCodes.length === 0 && (
          <p className="text-sm text-muted-foreground">Chưa có mã ưu đãi nào.</p>
        )}
      </div>
    </div>
  );
}
