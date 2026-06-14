"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, Gift, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { buildReferralRegisterUrl, buildReferralShareMessage } from "@/lib/referral/url";
import { cn } from "@/lib/utils";

interface ReferralShareButtonProps {
  referralCode: string;
  variant?: "nav" | "card" | "compact";
  className?: string;
}

export function ReferralShareButton({
  referralCode,
  variant = "nav",
  className,
}: ReferralShareButtonProps) {
  const [open, setOpen] = useState(false);
  const shareUrl = useMemo(() => buildReferralRegisterUrl(referralCode), [referralCode]);
  const shareMessage = useMemo(() => buildReferralShareMessage(referralCode), [referralCode]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Đã copy link giới thiệu!");
    } catch {
      toast.error("Không copy được — hãy chọn và copy thủ công");
    }
  }, [shareUrl]);

  const copyMessage = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      toast.success("Đã copy tin nhắn giới thiệu!");
    } catch {
      toast.error("Không copy được — hãy chọn và copy thủ công");
    }
  }, [shareMessage]);

  const shareNative = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Camba — Pro 1 tháng miễn phí",
          text: shareMessage,
          url: shareUrl,
        });
        return;
      } catch {
        /* user cancelled or unsupported */
      }
    }
    await copyMessage();
  }, [copyMessage, shareMessage, shareUrl]);

  const trigger =
    variant === "nav" ? (
      <Button
        type="button"
        size="sm"
        className={cn(
          "rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 font-bold text-white shadow hover:from-emerald-600 hover:to-teal-600",
          className
        )}
      >
        <Gift className="mr-1.5 h-4 w-4" />
        Giới thiệu
      </Button>
    ) : variant === "compact" ? (
      <Button type="button" size="sm" variant="outline" className={cn("rounded-full", className)}>
        <Gift className="mr-1.5 h-4 w-4 text-emerald-600" />
        Giới thiệu app
      </Button>
    ) : (
      <Button type="button" className={cn("w-full kid-btn-fun rounded-full", className)}>
        <Gift className="mr-2 h-4 w-4" />
        Giới thiệu bạn bè — tặng Pro 1 tháng
      </Button>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-extrabold">
            <Gift className="h-5 w-5 text-emerald-600" />
            Giới thiệu Camba
          </DialogTitle>
          <DialogDescription>
            Bạn bè <strong>đăng ký tài khoản mới</strong> qua link của bạn sẽ nhận{" "}
            <strong>Camba Pro 1 tháng miễn phí</strong>. Mỗi người chỉ được nhận một lần.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Link giới thiệu
            </p>
            <div className="flex gap-2">
              <Input readOnly value={shareUrl} className="text-sm" onFocus={(e) => e.target.select()} />
              <Button type="button" size="icon" variant="outline" className="shrink-0" onClick={copyLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 p-3 text-sm text-emerald-900">
            <p className="font-semibold">Mã của bạn: {referralCode}</p>
            <p className="mt-1 text-emerald-800">
              Gửi link qua Zalo, Messenger hoặc copy tin nhắn mẫu bên dưới.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" className="flex-1 rounded-full" onClick={shareNative}>
              <Share2 className="mr-2 h-4 w-4" />
              Chia sẻ
            </Button>
            <Button type="button" variant="outline" className="flex-1 rounded-full" onClick={copyMessage}>
              Copy tin nhắn
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
