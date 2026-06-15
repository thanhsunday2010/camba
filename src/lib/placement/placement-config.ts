import { Skill } from "@prisma/client";
import {
  PLACEMENT_PAPER_TITLES,
} from "@/lib/placement/paper-titles";

export type PlacementSlug =
  | "yle"
  | "secondary"
  | "adult"
  | "ielts-academic-full"
  | "ielts-gt-full"
  | "ielts-academic-short"
  | "ielts-gt-short";

export type PlacementPool =
  | "reading"
  | "listening"
  | "grammar"
  | "grammarMcq"
  | "writing"
  | "speaking";

export type PlacementSectionSpec = {
  pool: PlacementPool;
  count: number;
  label: string;
  timeLimitSeconds: number;
  skill: Skill;
};

export type PlacementSpec = {
  slug: PlacementSlug;
  title: string;
  totalTimeSeconds: number;
  sectionOrder: PlacementSectionSpec[];
};

export const PLACEMENT_SLUG_BY_TITLE: Record<string, PlacementSlug> = {
  [PLACEMENT_PAPER_TITLES.YLE]: "yle",
  [PLACEMENT_PAPER_TITLES.SECONDARY]: "secondary",
  [PLACEMENT_PAPER_TITLES.ADULT]: "adult",
  [PLACEMENT_PAPER_TITLES.IELTS_ACADEMIC_FULL]: "ielts-academic-full",
  [PLACEMENT_PAPER_TITLES.IELTS_GT_FULL]: "ielts-gt-full",
  [PLACEMENT_PAPER_TITLES.IELTS_ACADEMIC_SHORT]: "ielts-academic-short",
  [PLACEMENT_PAPER_TITLES.IELTS_GT_SHORT]: "ielts-gt-short",
};

const CAMBRIDGE_SECTIONS: Omit<PlacementSectionSpec, "count">[] = [
  {
    pool: "reading",
    label: "Reading",
    timeLimitSeconds: 600,
    skill: Skill.READING,
  },
  {
    pool: "listening",
    label: "Listening",
    timeLimitSeconds: 600,
    skill: Skill.LISTENING,
  },
  {
    pool: "grammar",
    label: "Grammar & Vocabulary",
    timeLimitSeconds: 600,
    skill: Skill.USE_OF_ENGLISH,
  },
];

const ADULT_GRAMMAR_SECTION: Omit<PlacementSectionSpec, "count"> = {
  pool: "grammarMcq",
  label: "Grammar & Vocabulary",
  timeLimitSeconds: 600,
  skill: Skill.USE_OF_ENGLISH,
};

function cambridgeSpec(
  slug: PlacementSlug,
  title: string,
  grammarPool: "grammar" | "grammarMcq"
): PlacementSpec {
  const sections = CAMBRIDGE_SECTIONS.map((s) =>
    s.pool === "grammar" && grammarPool === "grammarMcq"
      ? { ...ADULT_GRAMMAR_SECTION, count: 16 }
      : { ...s, count: s.pool === "grammar" || s.pool === "grammarMcq" ? 16 : 17 }
  );
  if (grammarPool === "grammarMcq") {
    return {
      slug,
      title,
      totalTimeSeconds: 1800,
      sectionOrder: [
        { ...sections[0], count: 17 },
        { ...sections[1], count: 17 },
        { ...ADULT_GRAMMAR_SECTION, count: 16 },
      ],
    };
  }
  return {
    slug,
    title,
    totalTimeSeconds: 1800,
    sectionOrder: sections.map((s) => ({
      ...s,
      count: s.pool === "grammar" ? 16 : 17,
    })),
  };
}

const IELTS_FULL_SECTIONS: Omit<PlacementSectionSpec, "count">[] = [
  {
    pool: "listening",
    label: "Listening (4 sections)",
    timeLimitSeconds: 1800,
    skill: Skill.LISTENING,
  },
  {
    pool: "reading",
    label: "Reading",
    timeLimitSeconds: 3600,
    skill: Skill.READING,
  },
  {
    pool: "writing",
    label: "Writing",
    timeLimitSeconds: 3600,
    skill: Skill.WRITING,
  },
  {
    pool: "speaking",
    label: "Speaking",
    timeLimitSeconds: 840,
    skill: Skill.SPEAKING,
  },
];

const IELTS_SHORT_SECTIONS: Omit<PlacementSectionSpec, "count">[] = [
  {
    pool: "listening",
    label: "Listening (4 sections)",
    timeLimitSeconds: 900,
    skill: Skill.LISTENING,
  },
  {
    pool: "reading",
    label: "Reading",
    timeLimitSeconds: 1800,
    skill: Skill.READING,
  },
  {
    pool: "writing",
    label: "Writing — Task 2 (Essay)",
    timeLimitSeconds: 1800,
    skill: Skill.WRITING,
  },
  {
    pool: "speaking",
    label: "Speaking — Part 2 (Cue card)",
    timeLimitSeconds: 420,
    skill: Skill.SPEAKING,
  },
];

function ieltsFullSpec(slug: PlacementSlug, title: string, readingLabel: string): PlacementSpec {
  return {
    slug,
    title,
    totalTimeSeconds: 9840,
    sectionOrder: [
      { ...IELTS_FULL_SECTIONS[0], count: 40 },
      { ...IELTS_FULL_SECTIONS[1], count: 40, label: readingLabel },
      { ...IELTS_FULL_SECTIONS[2], count: 2, label: "Writing — Task 1 & Task 2" },
      { ...IELTS_FULL_SECTIONS[3], count: 2, label: "Speaking — Part 1 & Part 2" },
    ],
  };
}

function ieltsShortSpec(slug: PlacementSlug, title: string, readingLabel: string): PlacementSpec {
  return {
    slug,
    title,
    totalTimeSeconds: 4920,
    sectionOrder: [
      { ...IELTS_SHORT_SECTIONS[0], count: 20 },
      { ...IELTS_SHORT_SECTIONS[1], count: 20, label: readingLabel },
      { ...IELTS_SHORT_SECTIONS[2], count: 1 },
      { ...IELTS_SHORT_SECTIONS[3], count: 1 },
    ],
  };
}

export const PLACEMENT_SPECS: Record<PlacementSlug, PlacementSpec> = {
  yle: cambridgeSpec("yle", PLACEMENT_PAPER_TITLES.YLE, "grammar"),
  secondary: cambridgeSpec("secondary", PLACEMENT_PAPER_TITLES.SECONDARY, "grammar"),
  adult: cambridgeSpec("adult", PLACEMENT_PAPER_TITLES.ADULT, "grammarMcq"),
  "ielts-academic-full": ieltsFullSpec(
    "ielts-academic-full",
    PLACEMENT_PAPER_TITLES.IELTS_ACADEMIC_FULL,
    "Reading — Academic (3 passages)"
  ),
  "ielts-gt-full": ieltsFullSpec(
    "ielts-gt-full",
    PLACEMENT_PAPER_TITLES.IELTS_GT_FULL,
    "Reading — General Training (3 sections)"
  ),
  "ielts-academic-short": ieltsShortSpec(
    "ielts-academic-short",
    PLACEMENT_PAPER_TITLES.IELTS_ACADEMIC_SHORT,
    "Reading — Academic (3 passages)"
  ),
  "ielts-gt-short": ieltsShortSpec(
    "ielts-gt-short",
    PLACEMENT_PAPER_TITLES.IELTS_GT_SHORT,
    "Reading — General Training (3 sections)"
  ),
};

export function resolvePlacementSlug(paper: {
  placementSlug: string | null;
  title: string;
}): PlacementSlug | null {
  if (paper.placementSlug && paper.placementSlug in PLACEMENT_SPECS) {
    return paper.placementSlug as PlacementSlug;
  }
  return PLACEMENT_SLUG_BY_TITLE[paper.title] ?? null;
}

export function getPlacementSpec(slug: PlacementSlug): PlacementSpec {
  return PLACEMENT_SPECS[slug];
}
