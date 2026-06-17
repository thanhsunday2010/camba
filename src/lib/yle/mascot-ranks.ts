export interface YleMascotRankDefinition {
  tier: number;
  name: string;
  emoji: string;
  description: string;
  /** Minimum practice sessions completed at this YLE level */
  minPractice: number;
  /** Minimum mock tests completed at this YLE level */
  minMocks: number;
  /** Minimum bank completion % at this YLE level */
  minCompletionPct: number;
}

export const YLE_MASCOT_RANKS: YleMascotRankDefinition[] = [
  {
    tier: 1,
    name: "Thỏ tập sự",
    emoji: "🐰",
    description: "Camba mới bay vào vũ trụ YLE — cứ luyện đều là lên hạng!",
    minPractice: 0,
    minMocks: 0,
    minCompletionPct: 0,
  },
  {
    tier: 2,
    name: "Phi hành gia nhí",
    emoji: "🚀",
    description: "Đã quen quỹ đạo — Camba bắt đầu khám phá các hành tinh kỹ năng.",
    minPractice: 3,
    minMocks: 0,
    minCompletionPct: 5,
  },
  {
    tier: 3,
    name: "Khám phá viên",
    emoji: "⭐",
    description: "Luyện đều và hoàn thành mock — Camba sáng lên giữa các vì sao.",
    minPractice: 10,
    minMocks: 1,
    minCompletionPct: 20,
  },
  {
    tier: 4,
    name: "Thủ lĩnh sao",
    emoji: "🌟",
    description: "Gần chinh phục cả hành tinh — mock và % hoàn thành ấn tượng!",
    minPractice: 25,
    minMocks: 3,
    minCompletionPct: 45,
  },
  {
    tier: 5,
    name: "Bậc thầy ngân hà",
    emoji: "👑",
    description: "Camba dẫn đầu vũ trụ YLE — kiên trì, mock giỏi, hoàn thành xuất sắc.",
    minPractice: 50,
    minMocks: 6,
    minCompletionPct: 70,
  },
];

export interface YleMascotRankProgress {
  current: YleMascotRankDefinition;
  next: YleMascotRankDefinition | null;
  /** 0–100 toward next tier */
  progressPct: number;
  metrics: {
    practiceCompleted: number;
    mockCompleted: number;
    completionPct: number;
  };
  /** Milestone rows for UI */
  milestones: { label: string; current: number; target: number; done: boolean }[];
}

function meetsRank(
  rank: YleMascotRankDefinition,
  practice: number,
  mocks: number,
  completionPct: number
): boolean {
  return (
    practice >= rank.minPractice &&
    mocks >= rank.minMocks &&
    completionPct >= rank.minCompletionPct
  );
}

function rankProgressToNext(
  current: YleMascotRankDefinition,
  next: YleMascotRankDefinition,
  practice: number,
  mocks: number,
  completionPct: number
): number {
  const parts: number[] = [];

  if (next.minPractice > current.minPractice) {
    const span = next.minPractice - current.minPractice;
    const into = practice - current.minPractice;
    parts.push(Math.min(100, Math.max(0, (into / span) * 100)));
  }
  if (next.minMocks > current.minMocks) {
    const span = next.minMocks - current.minMocks;
    const into = mocks - current.minMocks;
    parts.push(Math.min(100, Math.max(0, (into / span) * 100)));
  }
  if (next.minCompletionPct > current.minCompletionPct) {
    const span = next.minCompletionPct - current.minCompletionPct;
    const into = completionPct - current.minCompletionPct;
    parts.push(Math.min(100, Math.max(0, (into / span) * 100)));
  }

  if (parts.length === 0) return 100;
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
}

export function computeYleMascotRank(
  practiceCompleted: number,
  mockCompleted: number,
  completionPct: number
): YleMascotRankProgress {
  let current = YLE_MASCOT_RANKS[0]!;
  for (const rank of YLE_MASCOT_RANKS) {
    if (meetsRank(rank, practiceCompleted, mockCompleted, completionPct)) {
      current = rank;
    }
  }

  const next = YLE_MASCOT_RANKS.find((r) => r.tier === current.tier + 1) ?? null;
  const progressPct = next
    ? rankProgressToNext(current, next, practiceCompleted, mockCompleted, completionPct)
    : 100;

  const milestones = next
    ? [
        {
          label: "Bài luyện",
          current: practiceCompleted,
          target: next.minPractice,
          done: practiceCompleted >= next.minPractice,
        },
        {
          label: "Mock hoàn thành",
          current: mockCompleted,
          target: next.minMocks,
          done: mockCompleted >= next.minMocks,
        },
        {
          label: "% ngân hàng đề",
          current: completionPct,
          target: next.minCompletionPct,
          done: completionPct >= next.minCompletionPct,
        },
      ]
    : [];

  return {
    current,
    next,
    progressPct,
    metrics: {
      practiceCompleted,
      mockCompleted,
      completionPct,
    },
    milestones,
  };
}
