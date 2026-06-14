import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReferralShareButton } from "@/components/referral/referral-share-button";

interface ReferralShareCardProps {
  referralCode: string;
  referralCount?: number;
}

export function ReferralShareCard({ referralCode, referralCount = 0 }: ReferralShareCardProps) {
  return (
    <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-extrabold">
          🎁 Giới thiệu bạn bè
        </CardTitle>
        <CardDescription>
          Chia sẻ Camba — bạn mới đăng ký qua link của bạn nhận{" "}
          <strong className="text-emerald-800">Pro 1 tháng miễn phí</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {referralCount > 0 && (
          <p className="text-sm font-semibold text-emerald-800">
            Bạn đã giới thiệu {referralCount} người 🎉
          </p>
        )}
        <ReferralShareButton referralCode={referralCode} variant="card" />
      </CardContent>
    </Card>
  );
}
