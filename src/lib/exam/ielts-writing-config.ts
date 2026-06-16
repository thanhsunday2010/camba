import { ExamLevel, Skill } from "@prisma/client";
import type { PaperSection } from "@/lib/exam/paper-sections";

export type IeltsWritingTask = 1 | 2;

export const IELTS_WRITING_LEVEL: ExamLevel = "FCE";

export const IELTS_WRITING_MOCK_POOL_KEY = "IELTS:WRT:MOCK";

export function buildIeltsWritingPracticePoolKey(task: IeltsWritingTask): string {
  return `IELTS:WRT:T${task}`;
}

export function isIeltsWritingPracticePoolKey(key: string): boolean {
  return /^IELTS:WRT:T[12]$/.test(key);
}

export function parseIeltsWritingPracticePoolKey(key: string): IeltsWritingTask | null {
  const match = key.match(/^IELTS:WRT:T([12])$/);
  if (!match) return null;
  return Number(match[1]) as IeltsWritingTask;
}

export function isIeltsWritingMockPoolKey(key: string): boolean {
  return key === IELTS_WRITING_MOCK_POOL_KEY;
}

export function isIeltsWritingPaper(paper: {
  practicePoolKey?: string | null;
  mockPoolKey?: string | null;
}): boolean {
  const key = paper.practicePoolKey ?? paper.mockPoolKey;
  if (!key) return false;
  return isIeltsWritingPracticePoolKey(key) || isIeltsWritingMockPoolKey(key);
}

export const IELTS_WRITING_TASK_DEFS: Record<
  IeltsWritingTask,
  {
    task: IeltsWritingTask;
    label: string;
    shortLabel: string;
    description: string;
    practiceQuestionCount: number;
    mockQuestionCount: number;
    practiceTimeLimitSeconds: number;
    mockTimeLimitSeconds: number;
  }
> = {
  1: {
    task: 1,
    label: "Task 1 — Report / Letter",
    shortLabel: "Task 1",
    description: "Academic: mô tả biểu đồ · GT: thư formal/informal (≥150 từ)",
    practiceQuestionCount: 1,
    mockQuestionCount: 1,
    practiceTimeLimitSeconds: 1200,
    mockTimeLimitSeconds: 1200,
  },
  2: {
    task: 2,
    label: "Task 2 — Essay",
    shortLabel: "Task 2",
    description: "Bài luận quan điểm / thảo luận (≥250 từ)",
    practiceQuestionCount: 1,
    mockQuestionCount: 1,
    practiceTimeLimitSeconds: 2400,
    mockTimeLimitSeconds: 2400,
  },
};

export const IELTS_WRITING_TASKS: IeltsWritingTask[] = [1, 2];

export function buildIeltsWritingMockSections(): PaperSection[] {
  const t1 = IELTS_WRITING_TASK_DEFS[1].mockQuestionCount;
  return [
    {
      skill: Skill.WRITING,
      label: IELTS_WRITING_TASK_DEFS[1].label,
      startIndex: 0,
      endIndex: t1,
      timeLimit: IELTS_WRITING_TASK_DEFS[1].mockTimeLimitSeconds,
    },
    {
      skill: Skill.WRITING,
      label: IELTS_WRITING_TASK_DEFS[2].label,
      startIndex: t1,
      endIndex: t1 + IELTS_WRITING_TASK_DEFS[2].mockQuestionCount,
      timeLimit: IELTS_WRITING_TASK_DEFS[2].mockTimeLimitSeconds,
    },
  ];
}

export function buildIeltsWritingMockTimeLimit(): number {
  return IELTS_WRITING_TASKS.reduce(
    (sum, task) => sum + IELTS_WRITING_TASK_DEFS[task].mockTimeLimitSeconds,
    0
  );
}

export function getIeltsWritingMockQuestionCount(): number {
  return IELTS_WRITING_TASKS.reduce(
    (sum, task) => sum + IELTS_WRITING_TASK_DEFS[task].mockQuestionCount,
    0
  );
}

export function isIeltsWritingQuestionContent(content: unknown): boolean {
  if (!content || typeof content !== "object") return false;
  const c = content as Record<string, unknown>;
  return c.examTrack === "IELTS" && [1, 2].includes(Number(c.ieltsWritingTask));
}
