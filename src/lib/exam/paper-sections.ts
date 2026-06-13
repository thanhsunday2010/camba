import { Skill } from "@prisma/client";

export interface PaperSection {
  skill: Skill;
  label: string;
  startIndex: number;
  endIndex: number;
  timeLimit?: number;
}

export function parseSections(raw: unknown): PaperSection[] | null {
  if (!raw || !Array.isArray(raw)) return null;
  return raw as PaperSection[];
}

export function getSectionForIndex(
  sections: PaperSection[] | null,
  index: number
): PaperSection | null {
  if (!sections) return null;
  return sections.find((s) => index >= s.startIndex && index < s.endIndex) ?? null;
}
