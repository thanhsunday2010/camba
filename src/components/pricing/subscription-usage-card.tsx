import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ReferralShareButton } from "@/components/referral/referral-share-button";
import { getSubscriptionSummary } from "@/lib/subscription/service";
import { ensureUserReferralCode } from "@/lib/referral/codes";

interface SubscriptionUsageCardProps {
  userId: string;
}

function usagePct(count: number, limit: number) {
  if (limit <= 0) return 0;
  return Math.min(100, Math.round((count / limit) * 100));
}

export async function SubscriptionUsageCard({ userId }: SubscriptionUsageCardProps) {
  const [{ plan, usage, expiresAt, billingCycle }, referralCode] = await Promise.all([
    getSubscriptionSummary(userId),
    ensureUserReferralCode(userId),
  ]);

  const breakdown = [
    usage.writingAiGradingCount > 0 && `Writing ${usage.writingAiGradingCount}`,
    usage.speakingAiGradingCount > 0 && `Speaking ${usage.speakingAiGradingCount}`,
    usage.readingAiGradingCount > 0 && `Reading ${usage.readingAiGradingCount}`,
    usage.listeningAiGradingCount > 0 && `Listening ${usage.listeningAiGradingCount}`,
    usage.useOfEnglishAiGradingCount > 0 && `UoE ${usage.useOfEnglishAiGradingCount}`,
  ]
    .filter(Boolean)
    .join(" · ");

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
          <Progress value={usagePct(usage.practiceCount, usage.practiceLimit)} />
        </div>

        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span>Lượt AI hôm nay</span>
            <span>
              {usage.aiGradingCount}/{usage.aiGradingLimit} lượt
            </span>
          </div>
          <Progress value={usagePct(usage.aiGradingCount, usage.aiGradingLimit)} />
          {breakdown ? (
            <p className="mt-1 text-xs text-muted-foreground">Đã dùng: {breakdown}</p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              Chấm sửa & giải thích — dùng chung pool lượt
            </p>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Writing tối đa {usage.writingWordLimit} từ/lần · Speaking tối đa{" "}
          {usage.speakingWordLimit} từ/lần
        </p>
        {plan.id === "FREE" && (
          <div className="rounded-lg border border-purple-100 bg-white p-3 text-sm">
            <p className="font-semibold">Camba Pro — từ 30.000₫/tháng</p>
            <p className="text-muted-foreground">
              100 câu/ngày · 25 lượt AI/ngày (dùng chung) · 150 từ Writing/Speaking
            </p>
          </div>
        )}
        <ReferralShareButton referralCode={referralCode} variant="compact" className="w-full" />
        <Button asChild className="w-full rounded-full" variant={plan.id === "FREE" ? "fun" : "outline"}>
          <Link href="/pricing">{plan.id === "FREE" ? "Nâng cấp gói ✨" : "Đổi gói / gia hạn"}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
