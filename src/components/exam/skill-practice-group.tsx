import { ChevronRight } from "lucide-react";
import { SkillPaperList, type PaperListItem } from "@/components/exam/skill-paper-list";
import { cn } from "@/lib/utils";

type SkillGroupProps = {
  skillLabel: string;
  skillEmoji: string;
  practice: PaperListItem[];
  mocks: PaperListItem[];
  completedPaperIds: ReadonlySet<string>;
  newCount: number;
  defaultOpen?: boolean;
};

export function SkillPracticeGroup({
  skillLabel,
  skillEmoji,
  practice,
  mocks,
  completedPaperIds,
  newCount,
  defaultOpen = false,
}: SkillGroupProps) {
  const total = practice.length + mocks.length;

  if (total === 0) {
    return (
      <details className="group overflow-hidden rounded-2xl border-2 border-purple-100 bg-white shadow-sm">
        <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
          <ChevronRight className="h-5 w-5 shrink-0 text-purple-500 transition-transform group-open:rotate-90" />
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 text-base shadow-sm">
            {skillEmoji}
          </span>
          <span className="text-base font-extrabold text-purple-900">{skillLabel}</span>
          <span className="ml-auto text-xs font-medium text-muted-foreground">Chưa có đề</span>
        </summary>
        <div className="border-t border-purple-100 px-4 py-3">
          <p className="text-sm font-medium text-muted-foreground">
            Chưa có đề cho kỹ năng này.
          </p>
        </div>
      </details>
    );
  }

  return (
    <details
      open={defaultOpen}
      className="group overflow-hidden rounded-2xl border-2 border-purple-100 bg-white shadow-sm open:shadow-md"
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 transition-colors hover:bg-purple-50/60 [&::-webkit-details-marker]:hidden">
        <ChevronRight className="h-5 w-5 shrink-0 text-purple-500 transition-transform group-open:rotate-90" />
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 text-base shadow-sm">
          {skillEmoji}
        </span>
        <div className="min-w-0 flex-1 text-left">
          <p className="text-base font-extrabold text-purple-900">{skillLabel}</p>
          <p className="text-xs font-semibold text-muted-foreground">
            {practice.length > 0 && "1 bài · 10 câu ngẫu nhiên"}
            {practice.length > 0 && mocks.length > 0 && " · "}
            {mocks.length === 1 && "1 mock · đề ngẫu nhiên từ ngân hàng"}
            {mocks.length > 1 && `${mocks.length} mock`}
          </p>
        </div>
        {newCount > 0 && (
          <span className="shrink-0 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-700">
            {newCount} mới
          </span>
        )}
      </summary>

      <div className={cn("space-y-4 border-t border-purple-100 px-4 py-4")}>
        {practice.length > 0 && (
          <div>
                    <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-purple-700">
                      📚 Luyện tập · 10 câu / lần
                    </h3>
            <SkillPaperList papers={practice} completedPaperIds={completedPaperIds} />
          </div>
        )}

        {mocks.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-amber-700">
              ⏱ Mock test · đề ngẫu nhiên
            </h3>
            <SkillPaperList
              papers={mocks}
              completedPaperIds={completedPaperIds}
              className="border-amber-200"
            />
          </div>
        )}
      </div>
    </details>
  );
}
