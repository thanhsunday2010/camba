import { ExamLevel, Skill } from "@prisma/client";
import type { PaperSection } from "@/lib/exam/paper-sections";
import {
  IELTS_MODULE_DEFAULT,
  ieltsModuleCode,
  type IeltsModule,
} from "@/lib/exam/ielts-module";

export type IeltsWritingTask = 1 | 2;

export const IELTS_WRITING_LEVEL: ExamLevel = "FCE";

export function buildIeltsWritingMockPoolKey(
  module: IeltsModule = IELTS_MODULE_DEFAULT
): string {
  return `IELTS:${ieltsModuleCode(module)}:WRT:MOCK`;
}

export const IELTS_WRITING_MOCK_POOL_KEY = buildIeltsWritingMockPoolKey("ACADEMIC");

export function buildIeltsWritingPracticePoolKey(
  task: IeltsWritingTask,
  module: IeltsModule = IELTS_MODULE_DEFAULT
): string {
  return `IELTS:${ieltsModuleCode(module)}:WRT:T${task}`;
}

export function isIeltsWritingPracticePoolKey(key: string): boolean {
  return /^IELTS:(AC|GT):WRT:T[12]$/.test(key) || /^IELTS:WRT:T[12]$/.test(key);
}

export function parseIeltsWritingPracticePoolKey(key: string): {
  module: IeltsModule;
  task: IeltsWritingTask;
} | null {
  const tagged = key.match(/^IELTS:(AC|GT):WRT:T([12])$/);
  if (tagged) {
    return {
      module: tagged[1] === "GT" ? "GENERAL" : "ACADEMIC",
      task: Number(tagged[2]) as IeltsWritingTask,
    };
  }
  const legacy = key.match(/^IELTS:WRT:T([12])$/);
  if (legacy) {
    return { module: "ACADEMIC", task: Number(legacy[1]) as IeltsWritingTask };
  }
  return null;
}

export function isIeltsWritingMockPoolKey(key: string): boolean {
  return (
    key === IELTS_WRITING_MOCK_POOL_KEY ||
    /^IELTS:(AC|GT):WRT:MOCK$/.test(key) ||
    key === "IELTS:WRT:MOCK"
  );
}

export function parseIeltsWritingMockPoolKey(key: string): IeltsModule | null {
  if (key === "IELTS:WRT:MOCK" || key === IELTS_WRITING_MOCK_POOL_KEY) return "ACADEMIC";
  const m = key.match(/^IELTS:(AC|GT):WRT:MOCK$/);
  if (!m) return null;
  return m[1] === "GT" ? "GENERAL" : "ACADEMIC";
}

export function isIeltsWritingPaper(paper: {
  practicePoolKey?: string | null;
  mockPoolKey?: string | null;
}): boolean {
  const key = paper.practicePoolKey ?? paper.mockPoolKey;
  if (!key) return false;
  return isIeltsWritingPracticePoolKey(key) || isIeltsWritingMockPoolKey(key);
}

export function getIeltsWritingTaskDef(
  task: IeltsWritingTask,
  module: IeltsModule = IELTS_MODULE_DEFAULT
) {
  return IELTS_WRITING_TASK_DEFS[module][task];
}

export const IELTS_WRITING_TASK_DEFS: Record<
  IeltsModule,
  Record<
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
  >
> = {
  ACADEMIC: {
    1: {
      task: 1,
      label: "Task 1 — Academic Report",
      shortLabel: "Task 1",
      description:
        "Mô tả biểu đồ, bảng số liệu, bản đồ hoặc sơ đồ quy trình (≥150 từ)",
      practiceQuestionCount: 1,
      mockQuestionCount: 1,
      practiceTimeLimitSeconds: 1200,
      mockTimeLimitSeconds: 1200,
    },
    2: {
      task: 2,
      label: "Task 2 — Essay",
      shortLabel: "Task 2",
      description: "Bài luận Academic: quan điểm / thảo luận / giải pháp (≥250 từ)",
      practiceQuestionCount: 1,
      mockQuestionCount: 1,
      practiceTimeLimitSeconds: 2400,
      mockTimeLimitSeconds: 2400,
    },
  },
  GENERAL: {
    1: {
      task: 1,
      label: "Task 1 — Letter",
      shortLabel: "Task 1",
      description: "Viết thư formal, semi-formal hoặc informal (≥150 từ)",
      practiceQuestionCount: 1,
      mockQuestionCount: 1,
      practiceTimeLimitSeconds: 1200,
      mockTimeLimitSeconds: 1200,
    },
    2: {
      task: 2,
      label: "Task 2 — Essay",
      shortLabel: "Task 2",
      description: "Bài luận General Training (≥250 từ)",
      practiceQuestionCount: 1,
      mockQuestionCount: 1,
      practiceTimeLimitSeconds: 2400,
      mockTimeLimitSeconds: 2400,
    },
  },
};

export const IELTS_WRITING_TASKS: IeltsWritingTask[] = [1, 2];

export function buildIeltsWritingMockSections(
  module: IeltsModule = IELTS_MODULE_DEFAULT
): PaperSection[] {
  const t1 = getIeltsWritingTaskDef(1, module).mockQuestionCount;
  return [
    {
      skill: Skill.WRITING,
      label: getIeltsWritingTaskDef(1, module).label,
      startIndex: 0,
      endIndex: t1,
      timeLimit: getIeltsWritingTaskDef(1, module).mockTimeLimitSeconds,
    },
    {
      skill: Skill.WRITING,
      label: getIeltsWritingTaskDef(2, module).label,
      startIndex: t1,
      endIndex: t1 + getIeltsWritingTaskDef(2, module).mockQuestionCount,
      timeLimit: getIeltsWritingTaskDef(2, module).mockTimeLimitSeconds,
    },
  ];
}

export function buildIeltsWritingMockTimeLimit(
  module: IeltsModule = IELTS_MODULE_DEFAULT
): number {
  return IELTS_WRITING_TASKS.reduce(
    (sum, task) => sum + getIeltsWritingTaskDef(task, module).mockTimeLimitSeconds,
    0
  );
}

export function getIeltsWritingMockQuestionCount(): number {
  return IELTS_WRITING_TASKS.reduce(
    (sum, task) => sum + getIeltsWritingTaskDef(task, "ACADEMIC").mockQuestionCount,
    0
  );
}

export function isIeltsWritingQuestionContent(content: unknown): boolean {
  if (!content || typeof content !== "object") return false;
  const c = content as Record<string, unknown>;
  return c.examTrack === "IELTS" && [1, 2].includes(Number(c.ieltsWritingTask));
}

export function isIeltsWritingLetterTask(content: unknown): boolean {
  if (!content || typeof content !== "object") return false;
  const c = content as Record<string, unknown>;
  if (c.ieltsTask1Format === "letter") return true;
  const prompt = typeof c.taskPrompt === "string" ? c.taskPrompt : "";
  return /write a letter/i.test(prompt);
}
