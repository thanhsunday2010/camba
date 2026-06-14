import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getSubscriptionSummary } from "@/lib/subscription/service";

interface SubscriptionUsageCardProps {
  userId: string;
}

export async function SubscriptionUsageCard({ userId }: SubscriptionUsageCardProps) {
  const { plan, usage, expiresAt, billingCycle } = await getSubscriptionSummary(userId);
  const practicePct = Math.min(
    100,
    Math.round((usage.practiceCount / usage.practiceLimit) * 100)
  );
  const aiPct = Math.min(
    100,
    Math.round((usage.aiGradingCount / usage.aiGradingLimit) * 100)
  );

  return (
    <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 font-extrabold">
          <span>💎 Gói {plan.name}</span>
          {plan.id !== "FREE" && (
            <Badge variant="outline">{billingCycle === "YEARLY" ? "Theo năm" : "Theo tháng"}</Badge>
          )}
        </CardTitle>
        <CardDescription>
          {expiresAt
            ? `Hết hạn: ${expiresAt.toLocaleDateString("vi-VN")}`
            : plan.id === "FREE"
              ? "Miễn phí — nâng cấp để mở thêm giới hạn"
              : "Đang dùng gói miễn phí"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span>Luyện tập hôm nay</span>
            <span>
              {usage.practiceCount}/{usage.practiceLimit} câu
            </span>
          </div>
          <Progress value={practicePct} />
        </div>
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span>AI chấm sửa hôm nay</span>
            <span>
              {usage.aiGradingCount}/{usage.aiGradingLimit} lượt
            </span>
          </div>
          <Progress value={aiPct} />
        </div>
        <p className="text-xs text-muted-foreground">
          Writing tối đa {usage.writingWordLimit} từ/lần
          {usage.speakingWordLimit > 0 ? (
            <> · Speaking tối đa {usage.speakingWordLimit} từ/lần</>
          ) : (
            <> · Speaking chưa có (nâng cấp Pro)</>
          )}
        </p>
        {plan.id === "FREE" && (
          <div className="rounded-lg border border-purple-100 bg-white p-3 text-sm">
            <p className="font-semibold">Camba Pro — từ 30.000₫/tháng</p>
            <p className="text-muted-foreground">100 câu/ngày · 25 lượt AI · 150 từ Writing/Speaking</p>
          </div>
        )}
        <Button asChild className="w-full rounded-full" variant={plan.id === "FREE" ? "fun" : "outline"}>
          <Link href="/pricing">{plan.id === "FREE" ? "Nâng cấp gói ✨" : "Đổi gói / gia hạn"}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
