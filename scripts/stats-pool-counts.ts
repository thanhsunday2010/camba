/**
 * Thống kê số câu / kỹ năng / level trong pool luyện & mock.
 * Usage: npx tsx scripts/stats-pool-counts.ts
 */
import "dotenv/config";
import { ExamLevel, PrismaClient, Skill } from "@prisma/client";
import { computeRequiredPoolSizes } from "../prisma/seed/seed-targets";

const db = new PrismaClient();

const LEVELS: ExamLevel[] = ["STARTERS", "MOVERS", "FLYERS", "KET", "PET", "FCE"];

const SKILLS: {
  key: keyof ReturnType<typeof computeRequiredPoolSizes>;
  skill: Skill;
  label: string;
}[] = [
  { key: "reading", skill: Skill.READING, label: "Reading" },
  { key: "listening", skill: Skill.LISTENING, label: "Listening" },
  { key: "writing", skill: Skill.WRITING, label: "Writing" },
  { key: "speaking", skill: Skill.SPEAKING, label: "Speaking" },
  { key: "uoe", skill: Skill.USE_OF_ENGLISH, label: "UoE/Grammar" },
];

function pad(s: string, n: number) {
  return s.padEnd(n);
}

async function main() {
  const rows = await db.question.groupBy({
    by: ["level", "skill"],
    where: { placementSlug: null },
    _count: { id: true },
  });
  const map = new Map(rows.map((r) => [`${r.level}:${r.skill}`, r._count.id]));

  const colW = 14;
  const levelW = 10;

  console.log("\n=== Ngân hàng câu hỏi luyện/mock (không gồm placement) ===\n");
  console.log(pad("Level", levelW) + SKILLS.map((s) => pad(s.label, colW)).join("") + pad("Tổng", 8));
  console.log("-".repeat(levelW + SKILLS.length * colW + 8));

  let grand = 0;
  for (const level of LEVELS) {
    let rowTotal = 0;
    const cols = SKILLS.map(({ skill }) => {
      const n = map.get(`${level}:${skill}`) ?? 0;
      rowTotal += n;
      return pad(String(n), colW);
    });
    grand += rowTotal;
    console.log(pad(level, levelW) + cols.join("") + pad(String(rowTotal), 8));
  }

  console.log("-".repeat(levelW + SKILLS.length * colW + 8));
  console.log(
    pad("TỔNG", levelW) +
      SKILLS.map(({ skill }) => {
        let t = 0;
        for (const level of LEVELS) t += map.get(`${level}:${skill}`) ?? 0;
        return pad(String(t), colW);
      }).join("") +
      pad(String(grand), 8)
  );

  console.log("\n=== So với quota (computeRequiredPoolSizes) ===\n");
  console.log(
    pad("Level", levelW) +
      SKILLS.map((s) => pad(s.label, colW)).join("") +
      pad("Thiếu", 8)
  );
  console.log("-".repeat(levelW + SKILLS.length * colW + 8));

  let totalShort = 0;
  for (const level of LEVELS) {
    const req = computeRequiredPoolSizes(level);
    let short = 0;
    const cols = SKILLS.map(({ key, skill }) => {
      const current = map.get(`${level}:${skill}`) ?? 0;
      const target = req[key];
      const diff = Math.max(0, target - current);
      short += diff;
      const text = diff > 0 ? `${current}/${target}` : String(current);
      return pad(text, colW);
    });
    totalShort += short;
    console.log(pad(level, levelW) + cols.join("") + pad(String(short), 8));
  }

  console.log(`\nTổng còn thiếu so quota: ${totalShort} câu`);
  console.log("(Cột hiển thị hiện tại/quota khi thiếu; chỉ số hiện tại khi đủ)\n");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
