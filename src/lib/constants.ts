export const EXAM_LEVELS = [
  { value: "STARTERS", label: "Pre A1 Starters", group: "YLE" },
  { value: "MOVERS", label: "A1 Movers", group: "YLE" },
  { value: "FLYERS", label: "A2 Flyers", group: "YLE" },
  { value: "KET", label: "A2 Key (KET)", group: "Secondary" },
  { value: "PET", label: "B1 Preliminary (PET)", group: "Secondary" },
  { value: "FCE", label: "B2 First (FCE)", group: "Secondary" },
] as const;

export const SKILLS = [
  { value: "READING", label: "Reading", icon: "BookOpen" },
  { value: "WRITING", label: "Writing", icon: "PenLine" },
  { value: "LISTENING", label: "Listening", icon: "Headphones" },
  { value: "SPEAKING", label: "Speaking", icon: "Mic" },
  { value: "USE_OF_ENGLISH", label: "Grammar & UoE", icon: "Languages" },
] as const;

export const QUESTION_TYPES = [
  { value: "MCQ", label: "Trắc nghiệm" },
  { value: "GAP_FILL", label: "Điền từ" },
  { value: "FREE_TEXT", label: "Tự luận (AI chấm)" },
  { value: "SPEAKING_PROMPT", label: "Nói (AI chấm)" },
] as const;

export const PAPER_KINDS = [
  { value: "PRACTICE", label: "Luyện tập", description: "Đề luyện theo kỹ năng" },
  { value: "MOCK_SKILL", label: "Mock theo kỹ năng", description: "Thi thử 1 kỹ năng" },
  { value: "MOCK_FULL", label: "Mock full test", description: "Thi thử đầy đủ" },
  { value: "PLACEMENT", label: "Placement test", description: "Test trình độ" },
] as const;

export const USER_ROLES = [
  { value: "STUDENT", label: "Học sinh" },
  { value: "TEACHER", label: "Giáo viên" },
  { value: "ADMIN", label: "Quản trị" },
] as const;

export type ExamLevelValue = (typeof EXAM_LEVELS)[number]["value"];
export type SkillValue = (typeof SKILLS)[number]["value"];

export function formatExamLevel(level: string): string {
  return EXAM_LEVELS.find((e) => e.value === level)?.label ?? level;
}

export function formatSkill(skill: string): string {
  return SKILLS.find((s) => s.value === skill)?.label ?? skill;
}

export function formatPaperKind(kind: string): string {
  return PAPER_KINDS.find((k) => k.value === kind)?.label ?? kind;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
