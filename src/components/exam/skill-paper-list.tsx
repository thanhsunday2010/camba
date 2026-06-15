import Link from "next/link";
import { CheckCircle2, Clock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { shortPaperListTitle } from "@/lib/exam/paper-display";
import { cn } from "@/lib/utils";

export type PaperListItem = {
  id: string;
  title: string;
  description?: string | null;
  timeLimit?: number | null;
  isMockTest?: boolean;
};

interface SkillPaperListProps {
  papers: PaperListItem[];
  completedPaperIds: ReadonlySet<string>;
  /** Bật vùng cuộn khi số bài >= ngưỡng này (mặc định 4) */
  scrollThreshold?: number;
  className?: string;
}

function sortPapersNewFirst(papers: PaperListItem[], completed: ReadonlySet<string>) {
  return [...papers].sort((a, b) => {
    const aDone = completed.has(a.id);
    const bDone = completed.has(b.id);
    if (aDone !== bDone) return aDone ? 1 : -1;
    return a.title.localeCompare(b.title, "vi");
  });
}

export function SkillPaperList({
  papers,
  completedPaperIds,
  scrollThreshold = 4,
  className,
}: SkillPaperListProps) {
  if (papers.length === 0) return null;

  const sorted = sortPapersNewFirst(papers, completedPaperIds);
  const newCount = papers.filter((p) => !completedPaperIds.has(p.id)).length;
  const doneCount = papers.length - newCount;
  const scrollable = papers.length >= scrollThreshold;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border-2 border-purple-100 bg-white shadow-sm",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-100 bg-purple-50/60 px-3 py-2 text-xs font-semibold">
        <span className="text-purple-800">
          {newCount > 0 ? (
            <>
              <Sparkles className="mr-1 inline h-3.5 w-3.5 text-sky-500" />
              {newCount} mới
            </>
          ) : (
            "Đã hoàn thành tất cả 🎉"
          )}
        </span>
        {doneCount > 0 && (
          <span className="text-emerald-700">
            <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />
            {doneCount} đã làm
          </span>
        )}
      </div>

      <ul
        className={cn(
          "divide-y divide-purple-50",
          scrollable && "max-h-72 overflow-y-auto overscroll-contain scroll-smooth"
        )}
      >
        {sorted.map((paper) => {
          const done = completedPaperIds.has(paper.id);
          return (
            <li key={paper.id}>
              <Link
                href={`/practice/${paper.id}`}
                className={cn(
                  "flex items-start gap-2.5 px-3 py-2.5 transition-colors hover:bg-purple-50/90",
                  !done && "bg-sky-50/40"
                )}
              >
                {done ? (
                  <CheckCircle2
                    className="h-5 w-5 shrink-0 text-emerald-600"
                    aria-hidden
                  />
                ) : (
                  <Sparkles className="h-5 w-5 shrink-0 text-sky-500" aria-hidden />
                )}

                <div className="min-w-0 flex-1">
                  <p
                    className="text-sm font-bold leading-snug text-purple-900 break-words"
                    title={paper.title}
                  >
                    {shortPaperListTitle(paper.title)}
                  </p>
                  {(paper.timeLimit || paper.isMockTest) && (
                    <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] font-medium text-muted-foreground">
                      {paper.timeLimit != null && paper.timeLimit > 0 && (
                        <span className="inline-flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          {Math.floor(paper.timeLimit / 60)} phút
                        </span>
                      )}
                      {paper.isMockTest && <span>Mock test</span>}
                    </p>
                  )}
                </div>

                {done ? (
                  <Badge
                    variant="outline"
                    className="mt-0.5 shrink-0 border-emerald-200 px-1.5 py-0 text-[10px] font-bold text-emerald-700"
                  >
                    Đã làm
                  </Badge>
                ) : (
                  <Badge className="mt-0.5 shrink-0 bg-sky-500 px-1.5 py-0 text-[10px] font-bold hover:bg-sky-500">
                    New
                  </Badge>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {scrollable && newCount > 0 && (
        <p className="border-t border-purple-100 bg-purple-50/40 px-3 py-1.5 text-center text-[10px] font-medium text-muted-foreground">
          Cuộn trong danh sách để tìm bài New ↑
        </p>
      )}
    </div>
  );
}
