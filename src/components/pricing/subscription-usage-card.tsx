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
  const writingAiPct = Math.min(
    100,
    Math.round((usage.writingAiGradingCount / usage.writingAiGradingLimit) * 100)
  );
  const speakingAiPct = Math.min(
    100,
    Math.round((usage.speakingAiGradingCount / usage.speakingAiGradingLimit) * 100)
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
              : "Đang dùng gói trả phí"}
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
            <span>AI chấm Writing hôm nay</span>
            <span>
              {usage.writingAiGradingCount}/{usage.writingAiGradingLimit} lượt
            </span>
          </div>
          <Progress value={writingAiPct} />
        </div>
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span>AI chấm Speaking hôm nay</span>
            <span>
              {usage.speakingAiGradingCount}/{usage.speakingAiGradingLimit} lượt
            </span>
          </div>
          <Progress value={speakingAiPct} />
        </div>
        <p className="text-xs text-muted-foreground">
          Writing tối đa {usage.writingWordLimit} từ/lần · Speaking tối đa{" "}
          {usage.speakingWordLimit} từ/lần
        </p>
        {plan.id === "FREE" && (
          <div className="rounded-lg border border-purple-100 bg-white p-3 text-sm">
            <p className="font-semibold">Camba Pro — từ 30.000₫/tháng</p>
            <p className="text-muted-foreground">
              100 câu/ngày · 25 Writing + 25 Speaking AI · 150 từ/lần
            </p>
          </div>
        )}
        <Button asChild className="w-full rounded-full" variant={plan.id === "FREE" ? "fun" : "outline"}>
          <Link href="/pricing">{plan.id === "FREE" ? "Nâng cấp gói ✨" : "Đổi gói / gia hạn"}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
