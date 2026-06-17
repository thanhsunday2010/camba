"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { notifyGuestPlacementLimitHit } from "@/lib/promo/events";
import {
  PLACEMENT_CARD_THEMES,
  type PlacementCategoryTheme,
} from "@/lib/placement/categories";
import { buildPlacementAuthCallbackUrl } from "@/lib/placement/picker-url";
import { usePlacementStart } from "@/components/placement/use-placement-start";

interface PlacementStartCardProps {
  paper: {
    id: string;
    title: string;
    description: string | null;
    timeLimit: number | null;
  };
  theme?: PlacementCategoryTheme;
  placementRemaining?: number | null;
  placementLimit?: number | null;
}

export function PlacementStartCard({
  paper,
  theme = "cambridge",
  placementRemaining,
  placementLimit,
}: PlacementStartCardProps) {
  const cardTheme = PLACEMENT_CARD_THEMES[theme];
  const { startPlacement, loading, isLoggedIn, sessionPending } = usePlacementStart();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [showGuestForm, setShowGuestForm] = useState(false);

  async function begin(guest?: { fullName: string; phone: string }) {
    const res = await startPlacement(paper.id, guest);
    if (!res.ok && !isLoggedIn && res.error?.includes("trong tháng")) {
      notifyGuestPlacementLimitHit();
    }
  }

  return (
    <Card className={cardTheme.cardClass}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl font-extrabold">{paper.title}</CardTitle>
          <Badge className={cardTheme.badgeClass}>Placement</Badge>
        </div>
        {paper.description && (
          <CardDescription className="font-medium">{paper.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {paper.timeLimit && (
          <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Clock className="h-4 w-4" />
            {Math.floor(paper.timeLimit / 60)} phút
          </p>
        )}

        {sessionPending ? (
          <p className="text-sm font-medium text-muted-foreground">Đang kiểm tra phiên đăng nhập…</p>
        ) : isLoggedIn ? (
          <>
            {placementRemaining != null && placementLimit != null && (
              <p className="text-sm font-semibold text-muted-foreground">
                Còn {placementRemaining}/{placementLimit} lượt tuần này
              </p>
            )}
            <Button
              className="w-full kid-btn-fun"
              disabled={loading || placementRemaining === 0}
              onClick={() => begin()}
            >
              {loading
                ? "Đang mở..."
                : placementRemaining === 0
                  ? "Đã hết lượt tuần này"
                  : "Bắt đầu làm bài"}
            </Button>
            {placementRemaining === 0 && (
              <p className="text-center text-xs font-medium text-muted-foreground">
                Hết lượt placement tuần này — thử lại từ thứ Hai tuần sau.
              </p>
            )}
          </>
        ) : showGuestForm ? (
          <div className="space-y-3 rounded-xl border-2 border-purple-100 bg-white p-4">
            <p className="text-sm font-bold text-purple-800">
              Thông tin bắt buộc (không cần đăng ký tài khoản)
            </p>
            <p className="text-xs font-medium text-muted-foreground">
              Khách: <strong>1 lượt placement/tháng</strong> theo SĐT (mọi loại đề). Tiếp tục bài
              đang dở không tính thêm.
            </p>
            <div>
              <Label htmlFor={`name-${paper.id}`}>Họ tên (Full name) *</Label>
              <Input
                id={`name-${paper.id}`}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="mt-1 rounded-xl border-2"
              />
            </div>
            <div>
              <Label htmlFor={`phone-${paper.id}`}>Số ĐT (Phone number) *</Label>
              <Input
                id={`phone-${paper.id}`}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="0912345678"
                inputMode="numeric"
                className="mt-1 rounded-xl border-2"
              />
              <p className="mt-1 text-xs text-muted-foreground">Đúng 10 chữ số</p>
            </div>
            <Button
              className="w-full kid-btn-fun"
              disabled={loading || fullName.trim().length < 2 || phone.length !== 10}
              onClick={() => begin({ fullName: fullName.trim(), phone })}
            >
              {loading ? "Đang mở..." : "Bắt đầu test trình độ"}
            </Button>
          </div>
        ) : (
          <Button
            className="w-full kid-btn-fun"
            variant="fun"
            onClick={() => setShowGuestForm(true)}
          >
            Làm test không cần đăng nhập
          </Button>
        )}

        {!sessionPending && !isLoggedIn && !showGuestForm && (
          <p className="text-center text-xs font-medium text-muted-foreground">
            Khách: 1 lượt placement/tháng (theo SĐT).{" "}
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(buildPlacementAuthCallbackUrl({ paperId: paper.id }))}`}
              className="font-bold text-purple-600 underline"
            >
              Đăng nhập
            </Link>{" "}
            để làm thêm (2 lượt/tuần).
          </p>
        )}
      </CardContent>
    </Card>
  );
}
