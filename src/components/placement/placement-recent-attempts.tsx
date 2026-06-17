"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type RecentAttempt = {
  id: string;
  title: string;
  score: number | null;
  maxScore: number | null;
  submittedAt: string | null;
};

export function PlacementRecentAttempts() {
  const { data: session } = useSession();
  const [attempts, setAttempts] = useState<RecentAttempt[]>([]);

  useEffect(() => {
    if (!session?.user) {
      setAttempts([]);
      return;
    }

    let cancelled = false;

    fetch("/api/placement/recent")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data?.attempts) {
          setAttempts(data.attempts);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [session?.user]);

  if (attempts.length === 0) return null;

  return (
    <section>
      <h2 className="page-section-title mb-3 flex items-center gap-2 sm:mb-4">
        <Sparkles className="h-4 w-4 text-purple-500 sm:h-5 sm:w-5" />
        Kết quả gần đây
      </h2>
      <div className="space-y-3">
        {attempts.map((a) => (
          <Link
            key={a.id}
            href={`/placement/results/${a.id}`}
            className="block rounded-xl border-2 p-4 transition-colors hover:bg-purple-50"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold">{a.title}</span>
              {a.score !== null && a.maxScore && (
                <Badge variant="secondary">
                  {Math.round((a.score / a.maxScore) * 100)}%
                </Badge>
              )}
            </div>
            {a.submittedAt && (
              <p className="mt-1 text-sm text-muted-foreground">
                {new Date(a.submittedAt).toLocaleString("vi-VN")}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
