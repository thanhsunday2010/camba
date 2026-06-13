"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { formatDuration } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ExamTimerProps {
  timeLimit?: number | null;
  onTimeUp?: () => void;
  startedAt?: Date;
}

export function ExamTimer({ timeLimit, onTimeUp, startedAt }: ExamTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = startedAt ? new Date(startedAt).getTime() : Date.now();
    const interval = setInterval(() => {
      const secs = Math.floor((Date.now() - start) / 1000);
      setElapsed(secs);
      if (timeLimit && secs >= timeLimit && onTimeUp) {
        onTimeUp();
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLimit, onTimeUp, startedAt]);

  const remaining = timeLimit ? Math.max(0, timeLimit - elapsed) : elapsed;
  const isLow = timeLimit && remaining < 300;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium",
        isLow ? "border-red-300 bg-red-50 text-red-700" : "border-cambridge-200 bg-cambridge-50 text-cambridge-800"
      )}
    >
      <Clock className="h-4 w-4" />
      {timeLimit ? (
        <span>Còn lại: {formatDuration(remaining)}</span>
      ) : (
        <span>Thời gian: {formatDuration(elapsed)}</span>
      )}
    </div>
  );
}
