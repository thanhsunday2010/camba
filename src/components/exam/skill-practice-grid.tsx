import Link from "next/link";
import { CheckCircle2, Clock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type SkillGridPaper = {
  id: string;
  title: string;
  description?: string | null;
  timeLimit?: number | null;
  isMockTest?: boolean;
};

export type SkillGridItem = {
  skillLabel: string;
  skillEmoji: string;
  practiceInfo: string;
  mockInfo?: string;
  practice?: SkillGridPaper;
  mock?: SkillGridPaper;
  practiceDone?: boolean;
  mockDone?: boolean;
  mockLocked?: boolean;
};

type SkillPracticeGridProps = {
  skills: SkillGridItem[];
  mockLockedHint?: string;
};

function formatMinutes(seconds?: number | null): string | null {
  if (seconds == null || seconds <= 0) return null;
  return `${Math.floor(seconds / 60)} phút`;
}

function PaperLink({
  paper,
  done,
  variant,
  label,
  locked,
  lockedHint,
}: {
  paper: SkillGridPaper;
  done: boolean;
  variant: "practice" | "mock";
  label: string;
  locked?: boolean;
  lockedHint?: string;
}) {
  const minutes = formatMinutes(paper.timeLimit);
  const isPractice = variant === "practice";

  const className = cn(
    "flex flex-1 flex-col gap-1 rounded-xl border-2 px-3 py-3 transition-all",
    isPractice
      ? "border-purple-200 bg-purple-50/80 hover:border-purple-300 hover:bg-purple-50"
      : "border-amber-200 bg-amber-50/80 hover:border-amber-300 hover:bg-amber-50",
    !done && !locked && "ring-1 ring-sky-200/60",
    locked && "cursor-not-allowed opacity-70"
  );

  const inner = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "text-sm font-extrabold uppercase tracking-wide",
            isPractice ? "text-purple-700" : "text-amber-800"
          )}
        >
          {label}
        </span>
        {locked ? (
          <Badge variant="outline" className="h-5 shrink-0 px-1.5 text-[10px]">
            Khóa
          </Badge>
        ) : done ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
        ) : (
          <Badge className="h-5 shrink-0 bg-sky-500 px-1.5 text-[10px] hover:bg-sky-500">Mới</Badge>
        )}
      </div>
      {paper.description && (
        <p className="text-base font-medium leading-relaxed text-muted-foreground">{paper.description}</p>
      )}
      {minutes && (
        <p className="flex items-center gap-1.5 text-base font-semibold text-muted-foreground">
          <Clock className="h-4 w-4" />
          {minutes}
        </p>
      )}
      {locked && lockedHint && (
        <p className="text-xs font-semibold leading-snug text-amber-900">{lockedHint}</p>
      )}
    </>
  );

  if (locked) {
    return <div className={className}>{inner}</div>;
  }

  return (
    <Link href={`/practice/${paper.id}`} className={cn(className, "hover:shadow-md")}>
      {inner}
    </Link>
  );
}

export function SkillPracticeGrid({ skills, mockLockedHint }: SkillPracticeGridProps) {
  const available = skills.filter((s) => s.practice || s.mock);

  if (available.length === 0) {
    return (
      <p className="rounded-2xl border-2 border-dashed border-purple-200 bg-white p-8 text-center text-sm font-medium text-muted-foreground">
        Chưa có đề luyện tập cho level này.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {available.map((skill) => {
        const hasNew =
          (skill.practice && !skill.practiceDone) || (skill.mock && !skill.mockDone);

        return (
          <article
            key={skill.skillLabel}
            className={cn(
              "flex flex-col rounded-2xl border-2 border-purple-100 bg-white p-4 shadow-sm",
              hasNew && "border-sky-200/80 bg-gradient-to-br from-white to-sky-50/40"
            )}
          >
            <header className="mb-3 flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 text-xl shadow-sm">
                {skill.skillEmoji}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-extrabold text-purple-900">{skill.skillLabel}</h3>
                <p className="mt-1 text-base font-semibold leading-relaxed text-muted-foreground">
                  {skill.practiceInfo}
                </p>
                {skill.mockInfo && (
                  <p className="mt-0.5 text-base font-semibold leading-relaxed text-amber-800/90">
                    {skill.mockInfo}
                  </p>
                )}
              </div>
              {hasNew && (
                <Sparkles className="h-4 w-4 shrink-0 text-sky-500" aria-label="Có bài mới" />
              )}
            </header>

            <div className="mt-auto flex flex-col gap-2 sm:flex-row">
              {skill.practice && (
                <PaperLink
                  paper={skill.practice}
                  done={!!skill.practiceDone}
                  variant="practice"
                  label="Luyện tập"
                />
              )}
              {skill.mock && (
                <PaperLink
                  paper={skill.mock}
                  done={!!skill.mockDone}
                  variant="mock"
                  label="Mock test"
                  locked={skill.mockLocked}
                  lockedHint={skill.mockLocked ? mockLockedHint : undefined}
                />
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function FullMockGrid({
  papers,
  completedPaperIds,
  locked = false,
  lockedHint,
  lockedHref,
}: {
  papers: SkillGridPaper[];
  completedPaperIds: ReadonlySet<string>;
  locked?: boolean;
  lockedHint?: string;
  lockedHref?: string;
}) {
  if (papers.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {papers.map((paper) => {
        const done = completedPaperIds.has(paper.id);
        const minutes = formatMinutes(paper.timeLimit);

        const cardClass = cn(
          "rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm",
          !locked && "transition-all hover:border-amber-300 hover:shadow-md",
          !done && !locked && "ring-1 ring-sky-200/60",
          locked && "opacity-75"
        );

        const content = (
          <>
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="text-base font-extrabold text-amber-900">{paper.title}</h3>
              {locked ? (
                <Badge variant="outline">Pro</Badge>
              ) : done ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              ) : (
                <Badge className="shrink-0 bg-sky-500 hover:bg-sky-500">Mới</Badge>
              )}
            </div>
            {paper.description && (
              <p className="text-base font-medium leading-relaxed text-muted-foreground">
                {paper.description}
              </p>
            )}
            {minutes && (
              <p className="mt-2 flex items-center gap-1 text-sm font-semibold text-amber-800">
                <Clock className="h-3.5 w-3.5" />
                {minutes} · tất cả kỹ năng
              </p>
            )}
            {locked ? (
              <p className="mt-4 text-sm font-bold text-amber-900">
                {lockedHint ?? "Nâng cấp Pro để mở full mock →"}
              </p>
            ) : (
              <p className="mt-4 text-sm font-bold text-amber-900">Bắt đầu full mock →</p>
            )}
          </>
        );

        if (locked) {
          if (lockedHref) {
            return (
              <Link key={paper.id} href={lockedHref} className={cn(cardClass, "block hover:opacity-90")}>
                {content}
              </Link>
            );
          }
          return (
            <div key={paper.id} className={cn(cardClass, "cursor-not-allowed")}>
              {content}
            </div>
          );
        }

        return (
          <Link key={paper.id} href={`/practice/${paper.id}`} className={cardClass}>
            {content}
          </Link>
        );
      })}
    </div>
  );
}
