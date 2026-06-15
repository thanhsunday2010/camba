import { ExamLevel, Skill } from "@prisma/client";
import {
  ieltsBandToCefr,
  IELTS_SKILLS,
  mapIeltsBand,
} from "@/lib/placement/ielts-formats";

export type PlacementTrack = "YLE" | "SECONDARY" | "ADULT" | "IELTS";

export interface SkillResult {
  skill: Skill;
  correct: number;
  total: number;
  percent: number;
}

export type CefrSubLevel = "start" | "mid" | "end";

export interface PlacementReport {
  skills: SkillResult[];
  overallPercent: number;
  cefrLevel: string;
  cambridgeLevel: string;
  cambridgeExam: string;
  track: PlacementTrack;
  /** Band IELTS ước lượng — track IELTS */
  ieltsBand?: string;
  /** Vị trí trong band CEFR — chủ yếu dùng cho Adult */
  cefrSubLevel?: CefrSubLevel;
  cefrSubLevelLabel?: string;
  /** Tổng khiên Cambridge (3 kỹ năng × 5) — YLE & Secondary */
  shieldCount?: number;
  shieldMax?: number;
  /** Khiên từng kỹ năng (Reading, Listening, Use of English) */
  shieldBySkill?: { skill: Skill; count: number; max: number }[];
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

const CEFR_BANDS: Record<string, [number, number]> = {
  "Pre A1": [0, 24],
  A1: [25, 39],
  A2: [40, 54],
  B1: [55, 69],
  B2: [70, 84],
  C1: [85, 100],
};

function mapCefr(percent: number): string {
  if (percent < 25) return "Pre A1";
  if (percent < 40) return "A1";
  if (percent < 55) return "A2";
  if (percent < 70) return "B1";
  if (percent < 85) return "B2";
  return "C1";
}

export function mapCefrSubLevel(percent: number, cefrLevel: string): CefrSubLevel {
  const range = CEFR_BANDS[cefrLevel];
  if (!range) return "mid";
  const [lo, hi] = range;
  const span = hi - lo + 1;
  const offset = percent - lo;
  if (span <= 4) return "mid";
  if (offset < span / 3) return "start";
  if (offset < (2 * span) / 3) return "mid";
  return "end";
}

export const PLACEMENT_SHIELD_MAX_PER_SKILL = 5;
/** Tổng tối đa: Reading + Listening + Use of English */
export const PLACEMENT_SHIELD_MAX = PLACEMENT_SHIELD_MAX_PER_SKILL * 3;

const PLACEMENT_SHIELD_SKILLS: Skill[] = ["READING", "LISTENING", "USE_OF_ENGLISH"];

/** Map điểm % một kỹ năng sang số khiên Cambridge (1–5), theo thang YLE. */
export function mapSkillShieldCount(percent: number): number {
  if (percent >= 80) return 5;
  if (percent >= 60) return 4;
  if (percent >= 40) return 3;
  if (percent >= 20) return 2;
  return 1;
}

export function computePlacementShields(skillResults: SkillResult[]): {
  total: number;
  max: number;
  bySkill: { skill: Skill; count: number; max: number }[];
} {
  const bySkill = PLACEMENT_SHIELD_SKILLS.map((skill) => {
    const result = skillResults.find((s) => s.skill === skill);
    const count =
      result && result.total > 0 ? mapSkillShieldCount(result.percent) : 0;
    return { skill, count, max: PLACEMENT_SHIELD_MAX_PER_SKILL };
  });
  const total = bySkill.reduce((sum, s) => sum + s.count, 0);
  return { total, max: PLACEMENT_SHIELD_MAX, bySkill };
}

export function cefrSubLevelLabelVi(sub: CefrSubLevel): string {
  if (sub === "start") return "đầu level";
  if (sub === "mid") return "giữa level";
  return "cuối level";
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

function buildAdultRoute(
  cefrLevel: string,
  sub: CefrSubLevel,
  weakest: SkillResult | undefined
): string {
  const band = `${cefrLevel} (${cefrSubLevelLabelVi(sub)})`;
  const stageTips: Record<CefrSubLevel, string> = {
    start: "Tập trung mẫu câu ngắn: chào hỏi, mua sắm, đặt lịch hẹn và email cơ bản.",
    mid: "Mở rộng hội thoại công việc: họp ngắn, gọi điện khách hàng và email lịch sự.",
    end: "Luyện thuyết trình ngắn, xử lý tình huống công sở và email chuyên nghiệp phức tạp hơn.",
  };
  const skillHint =
    weakest && weakest.percent < 60
      ? ` Ưu tiên củng cố ${SKILL_LABELS[weakest.skill]} qua tình huống giao tiếp hàng ngày và công sở.`
      : " Tiếp tục luyện hội thoại đời sống và giao tiếp nơi làm việc.";
  return `Trình độ CEFR ${band}. ${stageTips[sub]}${skillHint}`;
}

function buildIeltsRoute(band: string, weakest: SkillResult | undefined): string {
  const cefr = ieltsBandToCefr(band);
  const skillHint =
    weakest && weakest.percent < 60
      ? ` Ưu tiên luyện ${SKILL_LABELS[weakest.skill]} — thường là kỹ năng kéo band xuống.`
      : " Tiếp tục luyện đề IELTS full và rút gọn để ổn định band.";
  return `Band IELTS ước lượng: ${band} (tương đương CEFR ${cefr}).${skillHint} Lộ trình đầy đủ gồm cả 4 kỹ năng như thi thật.`;
}

export function evaluatePlacement(
  skillResults: SkillResult[],
  track: PlacementTrack = "SECONDARY"
): PlacementReport {
  const objectiveSkills =
    track === "IELTS"
      ? IELTS_SKILLS
      : (["READING", "LISTENING", "USE_OF_ENGLISH"] as Skill[]);
  const objective = skillResults.filter((s) => objectiveSkills.includes(s.skill));
  const overallPercent =
    objective.length > 0
      ? Math.round(objective.reduce((sum, s) => sum + s.percent, 0) / objective.length)
      : 0;

  const cefrLevel =
    track === "IELTS" ? ieltsBandToCefr(mapIeltsBand(overallPercent)) : mapCefr(overallPercent);
  const cefrSubLevel = mapCefrSubLevel(overallPercent, mapCefr(overallPercent));
  const cefrSubLabel = cefrSubLevelLabelVi(cefrSubLevel);
  const ieltsBand = track === "IELTS" ? mapIeltsBand(overallPercent) : undefined;

  const cambridge =
    track === "YLE"
      ? mapCambridgeYle(overallPercent)
      : track === "ADULT" || track === "IELTS"
        ? { level: "", exam: "" }
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

  const recommendation =
    track === "ADULT"
      ? buildAdultRoute(mapCefr(overallPercent), cefrSubLevel, weakest)
      : track === "IELTS"
        ? buildIeltsRoute(ieltsBand!, weakest)
        : weakest
          ? `Nên luyện thêm ${SKILL_LABELS[weakest.skill]} trước khi thi ${cambridge.exam}.`
          : `Tiếp tục luyện đề mock ${cambridge.exam} để củng cố kỹ năng.`;

  const summary =
    track === "ADULT"
      ? `Trình độ CEFR: ${mapCefr(overallPercent)} (${cefrSubLabel}). Điểm trung bình các kỹ năng khách quan: ${overallPercent}%.`
      : track === "IELTS"
        ? `Band IELTS ước lượng: ${ieltsBand} (CEFR ${cefrLevel}). Dựa trên 4 kỹ năng: Listening, Reading, Writing & Speaking — ${overallPercent}% trung bình.`
        : (() => {
            const shields = computePlacementShields(skillResults);
            return `Trình độ tổng thể: ${cefrLevel} (CEFR) — tương đương ${cambridge.level}. Tương đương khoảng ${shields.total}/${shields.max} khiên Cambridge. Điểm trung bình các kỹ năng khách quan: ${overallPercent}%.`;
          })();

  const shields =
    track === "YLE" || track === "SECONDARY"
      ? computePlacementShields(skillResults)
      : undefined;

  return {
    skills: skillResults,
    overallPercent,
    cefrLevel,
    cambridgeLevel: cambridge.level,
    cambridgeExam: cambridge.exam,
    track,
    ieltsBand,
    cefrSubLevel: track === "ADULT" ? cefrSubLevel : undefined,
    cefrSubLevelLabel: track === "ADULT" ? cefrSubLabel : undefined,
    shieldCount: shields?.total,
    shieldMax: shields?.max,
    shieldBySkill: shields?.bySkill,
    strengths,
    weaknesses,
    recommendation,
    summary,
  };
}

export function inferTrackFromLevels(levels: ExamLevel[]): "YLE" | "SECONDARY" {
  const yle = levels.some((l) => ["STARTERS", "MOVERS", "FLYERS"].includes(l));
  const secondary = levels.some((l) => ["KET", "PET", "FCE"].includes(l));
  if (yle && !secondary) return "YLE";
  return "SECONDARY";
}
