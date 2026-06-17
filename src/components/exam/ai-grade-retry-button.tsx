"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Props = {
  attemptId: string;
  questionId: string;
  feedbackType: "writing" | "speaking";
  studentAnswer: string;
};

export function AiGradeRetryButton({
  attemptId,
  questionId,
  feedbackType,
  studentAnswer,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRetry = async () => {
    setLoading(true);
    try {
      const endpoint =
        feedbackType === "writing" ? "/api/ai/grade-writing" : "/api/ai/grade-speaking";
      const body =
        feedbackType === "writing"
          ? { questionId, attemptId, studentAnswer }
          : { questionId, attemptId, transcript: studentAnswer };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(err.error ?? "Không thể chấm AI. Thử lại sau.");
        return;
      }

      toast.success("AI đã chấm xong!");
      router.refresh();
    } catch {
      toast.error("Không thể chấm AI. Thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="rounded-full"
      disabled={loading}
      onClick={() => void handleRetry()}
    >
      {loading ? "Đang chấm..." : "Chấm lại bằng AI"}
    </Button>
  );
}
