"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";

interface VietQrDisplayProps {
  vietQrUrl: string;
  transferContent: string;
  amountLabel: string;
  bankSummary?: string;
  variant?: "amber" | "sky";
}

function proxyUrl(vietQrUrl: string): string {
  return `/api/payment/vietqr-image?url=${encodeURIComponent(vietQrUrl)}`;
}

export function VietQrDisplay({
  vietQrUrl,
  transferContent,
  amountLabel,
  bankSummary,
  variant = "amber",
}: VietQrDisplayProps) {
  const [busy, setBusy] = useState<"download" | "share" | null>(null);

  async function fetchQrBlob(): Promise<Blob> {
    const res = await fetch(proxyUrl(vietQrUrl));
    if (!res.ok) throw new Error("fetch failed");
    return res.blob();
  }

  async function handleDownload() {
    setBusy("download");
    try {
      const blob = await fetchQrBlob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `camba-vietqr-${transferContent}.jpg`;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
      toast.success("Đã tải ảnh mã QR");
    } catch {
      toast.error("Không tải được ảnh QR. Thử lại sau.");
    } finally {
      setBusy(null);
    }
  }

  async function handleShare() {
    setBusy("share");
    const shareText = [
      "Chuyển khoản Camba",
      amountLabel,
      `Nội dung CK: ${transferContent}`,
      bankSummary,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      if (typeof navigator.share === "function") {
        try {
          const blob = await fetchQrBlob();
          const file = new File([blob], `camba-vietqr-${transferContent}.jpg`, {
            type: blob.type || "image/jpeg",
          });
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({
              title: "Mã QR chuyển khoản Camba",
              text: shareText,
              files: [file],
            });
            return;
          }
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") return;
        }

        await navigator.share({
          title: "Mã QR chuyển khoản Camba",
          text: shareText,
          url: vietQrUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(`${shareText}\n\nLink QR: ${vietQrUrl}`);
      toast.success("Đã copy thông tin chuyển khoản");
    } catch {
      toast.error("Không chia sẻ được. Hãy tải ảnh và gửi thủ công.");
    } finally {
      setBusy(null);
    }
  }

  const titleClass =
    variant === "sky" ? "font-bold text-sky-900" : "font-semibold text-amber-900";

  return (
    <div className="flex flex-col items-center gap-3 pt-2">
      <p className={titleClass}>Quét mã VietQR</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={proxyUrl(vietQrUrl)}
        alt="Mã QR chuyển khoản VietQR"
        className="max-w-[220px] rounded-lg border bg-white p-2"
      />
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          disabled={busy !== null}
          onClick={handleDownload}
        >
          <Download className="mr-1.5 h-4 w-4" />
          {busy === "download" ? "Đang tải..." : "Tải ảnh QR"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          disabled={busy !== null}
          onClick={handleShare}
        >
          <Share2 className="mr-1.5 h-4 w-4" />
          {busy === "share" ? "Đang chia sẻ..." : "Chia sẻ QR"}
        </Button>
      </div>
    </div>
  );
}
