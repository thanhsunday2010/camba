import { ExamLevel, Skill } from "@prisma/client";

export interface SkillResult {
  skill: Skill;
  correct: number;
  total: number;
  percent: number;
}

export interface PlacementReport {
  skills: SkillResult[];
  overallPercent: number;
  cefrLevel: string;
  cambridgeLevel: string;
  cambridgeExam: string;
  track: "YLE" | "SECONDARY";
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  summary: string;
}

const SKILL_LABELS: Record<Skill, string> = {
  READING: "Reading",
  LISTENING: "Listening",
  USE_OF_ENGLISH: "Use of English",
  WRITING: "Writing",
  SPEAKING: "Speaking",
};

function mapCefr(percent: number): string {
  if (percent < 25) return "Pre A1";
  if (percent < 40) return "A1";
  if (percent < 55) return "A2";
  if (percent < 70) return "B1";
  if (percent < 85) return "B2";
  return "C1";
}

function mapCambridgeYle(percent: number): { level: string; exam: string } {
  if (percent < 30) return { level: "Pre A1 Starters", exam: "YLE Starters" };
  if (percent < 50) return { level: "A1 Movers", exam: "YLE Movers" };
  if (percent < 65) return { level: "A2 Flyers", exam: "YLE Flyers" };
  if (percent < 78) return { level: "A2 Key (KET)", exam: "Cambridge A2 Key" };
  return { level: "B1 Preliminary (PET)", exam: "Cambridge B1 Preliminary" };
}

function mapCambridgeSecondary(percent: number): { level: string; exam: string } {
  if (percent < 35) return { level: "A1", exam: "YLE Movers / A2 Key preparation" };
  if (percent < 50) return { level: "A2 Key (KET)", exam: "Cambridge A2 Key for Schools" };
  if (percent < 65) return { level: "B1 Preliminary (PET)", exam: "Cambridge B1 Preliminary" };
  if (percent < 80) return { level: "B2 First (FCE)", exam: "Cambridge B2 First" };
  return { level: "C1 Advanced (CAE)", exam: "Cambridge C1 Advanced preparation" };
}

export function evaluatePlacement(
  skillResults: SkillResult[],
  track: "YLE" | "SECONDARY" = "SECONDARY"
): PlacementReport {
  const objective = skillResults.filter((s) =>
    ["READING", "LISTENING", "USE_OF_ENGLISH"].includes(s.skill)
  );
  const overallPercent =
    objective.length > 0
      ? Math.round(
          objective.reduce((sum, s) => sum + s.percent, 0) / objective.length
        )
      : 0;

  const cefrLevel = mapCefr(overallPercent);
  const cambridge =
    track === "YLE"
      ? mapCambridgeYle(overallPercent)
      : mapCambridgeSecondary(overallPercent);

  const strengths = skillResults
    .filter((s) => s.percent >= 70 && s.total > 0)
    .map((s) => `${SKILL_LABELS[s.skill]} (${s.percent}%)`);

  const weaknesses = skillResults
    .filter((s) => s.percent < 55 && s.total > 0)
    .map((s) => `${SKILL_LABELS[s.skill]} (${s.percent}%)`);

  const weakest = [...skillResults]
    .filter((s) => s.total > 0)
    .sort((a, b) => a.percent - b.percent)[0];

  const recommendation = weakest
    ? `Nên luyện thêm ${SKILL_LABELS[weakest.skill]} trước khi thi ${cambridge.exam}.`
    : `Tiếp tục luyện đề mock ${cambridge.exam} để củng cố kỹ năng.`;

  const summary = `Trình độ tổng thể: ${cefrLevel} (CEFR) — tương đương ${cambridge.level}. Điểm trung bình các kỹ năng khách quan: ${overallPercent}%.`;

  return {
    skills: skillResults,
    overallPercent,
    cefrLevel,
    cambridgeLevel: cambridge.level,
    cambridgeExam: cambridge.exam,
    track,
    strengths,
    weaknesses,
    recommendation,
    summary,
  };
}

export function inferTrackFromLevels(levels: ExamLevel[]): "YLE" | "SECONDARY" {
  const yle = levels.some((l) =>
    ["STARTERS", "MOVERS", "FLYERS"].includes(l)
  );
  const secondary = levels.some((l) => ["KET", "PET", "FCE"].includes(l));
  if (yle && !secondary) return "YLE";
  return "SECONDARY";
}
