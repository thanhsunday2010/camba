import { ExamLevel, Skill } from "@prisma/client";

/** Một kỹ năng và số câu lấy từ ngân hàng đề khi tạo full mock */
export type MockSectionSkillSlice = {
  skill: Skill;
  count: number;
};

export type CambridgeMockSectionSpec = {
  label: string;
  slices: MockSectionSkillSlice[];
  /** Thời gian phần thi (giây) — theo handbook Cambridge */
  timeLimitSeconds: number;
};

export type CambridgeMockFormat = {
  level: ExamLevel;
  paperTitle: string;
  sections: CambridgeMockSectionSpec[];
};

function sectionSummary(sections: CambridgeMockSectionSpec[]): string {
  return sections
    .map((s) => `${s.label} (${Math.round(s.timeLimitSeconds / 60)} phút)`)
    .join(" → ");
}

export function cambridgeMockDescription(format: CambridgeMockFormat): string {
  return `Full mock ${format.level} theo format Cambridge: ${sectionSummary(format.sections)}`;
}

export function cambridgeMockTotalSeconds(format: CambridgeMockFormat): number {
  return format.sections.reduce((sum, s) => sum + s.timeLimitSeconds, 0);
}

/**
 * Cấu trúc full mock theo Cambridge English Qualifications (thi trên giấy / digital).
 * Thời gian và thứ tự phần thi khớp handbook; số câu là mức gần đúng với đề thật.
 */
export const CAMBRIDGE_MOCK_FORMATS: Record<ExamLevel, CambridgeMockFormat> = {
  STARTERS: {
    level: ExamLevel.STARTERS,
    paperTitle: "STARTERS Full Mock — Cambridge Format",
    sections: [
      {
        label: "Reading & Writing",
        slices: [
          { skill: Skill.READING, count: 15 },
          { skill: Skill.WRITING, count: 1 },
        ],
        timeLimitSeconds: 20 * 60,
      },
      {
        label: "Listening",
        slices: [{ skill: Skill.LISTENING, count: 20 }],
        timeLimitSeconds: 20 * 60,
      },
      {
        label: "Speaking",
        slices: [{ skill: Skill.SPEAKING, count: 1 }],
        timeLimitSeconds: 5 * 60,
      },
    ],
  },
  MOVERS: {
    level: ExamLevel.MOVERS,
    paperTitle: "MOVERS Full Mock — Cambridge Format",
    sections: [
      {
        label: "Reading & Writing",
        slices: [
          { skill: Skill.READING, count: 28 },
          { skill: Skill.WRITING, count: 2 },
        ],
        timeLimitSeconds: 30 * 60,
      },
      {
        label: "Listening",
        slices: [{ skill: Skill.LISTENING, count: 25 }],
        timeLimitSeconds: 25 * 60,
      },
      {
        label: "Speaking",
        slices: [{ skill: Skill.SPEAKING, count: 1 }],
        timeLimitSeconds: 8 * 60,
      },
    ],
  },
  FLYERS: {
    level: ExamLevel.FLYERS,
    paperTitle: "FLYERS Full Mock — Cambridge Format",
    sections: [
      {
        label: "Reading & Writing",
        slices: [
          { skill: Skill.READING, count: 32 },
          { skill: Skill.WRITING, count: 2 },
        ],
        timeLimitSeconds: 40 * 60,
      },
      {
        label: "Listening",
        slices: [{ skill: Skill.LISTENING, count: 25 }],
        timeLimitSeconds: 30 * 60,
      },
      {
        label: "Speaking",
        slices: [{ skill: Skill.SPEAKING, count: 1 }],
        timeLimitSeconds: 8 * 60,
      },
    ],
  },
  KET: {
    level: ExamLevel.KET,
    paperTitle: "KET Full Mock — Cambridge Format",
    sections: [
      {
        label: "Reading & Writing",
        slices: [
          { skill: Skill.READING, count: 30 },
          { skill: Skill.WRITING, count: 2 },
        ],
        timeLimitSeconds: 60 * 60,
      },
      {
        label: "Listening",
        slices: [{ skill: Skill.LISTENING, count: 25 }],
        timeLimitSeconds: 30 * 60,
      },
      {
        label: "Speaking",
        slices: [{ skill: Skill.SPEAKING, count: 1 }],
        timeLimitSeconds: 10 * 60,
      },
    ],
  },
  PET: {
    level: ExamLevel.PET,
    paperTitle: "PET Full Mock — Cambridge Format",
    sections: [
      {
        label: "Reading",
        slices: [{ skill: Skill.READING, count: 25 }],
        timeLimitSeconds: 45 * 60,
      },
      {
        label: "Writing",
        slices: [{ skill: Skill.WRITING, count: 2 }],
        timeLimitSeconds: 45 * 60,
      },
      {
        label: "Listening",
        slices: [{ skill: Skill.LISTENING, count: 25 }],
        timeLimitSeconds: 30 * 60,
      },
      {
        label: "Speaking",
        slices: [{ skill: Skill.SPEAKING, count: 1 }],
        timeLimitSeconds: 14 * 60,
      },
    ],
  },
  FCE: {
    level: ExamLevel.FCE,
    paperTitle: "FCE Full Mock — Cambridge Format",
    sections: [
      {
        label: "Reading & Use of English",
        slices: [
          { skill: Skill.READING, count: 15 },
          { skill: Skill.USE_OF_ENGLISH, count: 15 },
        ],
        timeLimitSeconds: 75 * 60,
      },
      {
        label: "Writing",
        slices: [{ skill: Skill.WRITING, count: 2 }],
        timeLimitSeconds: 80 * 60,
      },
      {
        label: "Listening",
        slices: [{ skill: Skill.LISTENING, count: 25 }],
        timeLimitSeconds: 40 * 60,
      },
      {
        label: "Speaking",
        slices: [{ skill: Skill.SPEAKING, count: 1 }],
        timeLimitSeconds: 14 * 60,
      },
    ],
  },
};

export function getCambridgeMockFormat(level: ExamLevel): CambridgeMockFormat {
  return CAMBRIDGE_MOCK_FORMATS[level];
}

/** Kiểm tra ngân hàng đề đủ câu trước khi seed full mock */
export function validateMockContentPools(
  level: ExamLevel,
  pools: Partial<Record<Skill, number>>
): void {
  const format = getCambridgeMockFormat(level);
  const needed: Partial<Record<Skill, number>> = {};
  for (const section of format.sections) {
    for (const slice of section.slices) {
      needed[slice.skill] = (needed[slice.skill] ?? 0) + slice.count;
    }
  }
  for (const [skill, count] of Object.entries(needed)) {
    const available = pools[skill as Skill] ?? 0;
    if (available < count) {
      throw new Error(
        `${level} full mock: cần ${count} câu ${skill}, ngân hàng chỉ có ${available}`
      );
    }
  }
}
