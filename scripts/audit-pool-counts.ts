import { PrismaClient, Skill, ExamLevel } from "@prisma/client";
const MIN_POOL = 200;
const LEVELS: ExamLevel[] = ["STARTERS", "MOVERS", "FLYERS", "KET", "PET", "FCE"];
const SKILLS: Skill[] = [
  Skill.READING,
  Skill.LISTENING,
  Skill.WRITING,
  Skill.SPEAKING,
  Skill.USE_OF_ENGLISH,
];

const db = new PrismaClient();

async function main() {
  const rows = await db.question.groupBy({
    by: ["level", "skill"],
    where: { placementSlug: null },
    _count: { id: true },
  });
  const map = new Map(rows.map((r) => [`${r.level}:${r.skill}`, r._count.id]));

  let totalNeed = 0;
  console.log(`\nNgưỡng tối thiểu: ${MIN_POOL} câu / kỹ năng / level\n`);
  console.log("level\tskill\tcurrent\tneed");

  for (const level of LEVELS) {
    for (const skill of SKILLS) {
      const current = map.get(`${level}:${skill}`) ?? 0;
      const need = Math.max(0, MIN_POOL - current);
      totalNeed += need;
      console.log(`${level}\t${skill}\t${current}\t${need}`);
    }
  }

  console.log(`\nTổng cần bổ sung: ${totalNeed} câu`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
