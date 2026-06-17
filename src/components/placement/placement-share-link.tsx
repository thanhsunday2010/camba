"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  buildPlacementShareUrl,
  type PlacementPickerPreset,
} from "@/lib/placement/picker-url";

type PlacementShareLinkProps = {
  preset: PlacementPickerPreset;
  label?: string;
};

export function PlacementShareLink({ preset, label }: PlacementShareLinkProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = useMemo(() => buildPlacementShareUrl(preset), [preset]);

  const shareTitle = label ? `Test trình độ: ${label}` : "Test trình độ Camba";

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Đã copy link!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Không copy được link");
    }
  }, [shareUrl]);

  const shareNative = useCallback(async () => {
    const text = `${shareTitle}\n${shareUrl}`;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: shareTitle, text, url: shareUrl });
        return;
      }
      await copyLink();
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      await copyLink();
    }
  }, [copyLink, shareTitle, shareUrl]);

  return (
    <div className="rounded-xl border-2 border-sky-100 bg-sky-50/60 p-2.5 sm:p-3">
      <p className="text-[11px] font-bold text-sky-900 sm:text-xs">Chia sẻ link bài test đã chọn</p>
      <p className="mt-0.5 truncate font-mono text-[10px] text-sky-800/80 sm:text-[11px]">{shareUrl}</p>
      <div className="mt-2 flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 flex-1 rounded-full text-xs font-bold"
          onClick={() => void copyLink()}
        >
          {copied ? <Check className="mr-1 h-3.5 w-3.5" /> : <Link2 className="mr-1 h-3.5 w-3.5" />}
          {copied ? "Đã copy" : "Copy link"}
        </Button>
        <Button
          type="button"
          size="sm"
          className="h-8 flex-1 rounded-full text-xs font-bold kid-btn-fun"
          onClick={() => void shareNative()}
        >
          <Share2 className="mr-1 h-3.5 w-3.5" />
          Chia sẻ
        </Button>
      </div>
    </div>
  );
}
