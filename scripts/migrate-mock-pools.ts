/**
 * Gộp đề mock: 1 đề pool / kỹ năng / level + 1 full mock / level, ẩn các đề mock cũ.
 * Usage: npm run content:migrate-mock-pools
 */
import "dotenv/config";
import { ExamLevel, PaperKind, PrismaClient, Skill } from "@prisma/client";
import {
  buildFullMockPaperSections,
  cambridgeMockDescription,
  cambridgeMockTotalSeconds,
  fullMockQuestionCount,
  getCambridgeMockFormat,
} from "../src/lib/exam/cambridge-mock-formats";
import {
  getMockSkillQuestionCount,
  skillMockTimeLimit,
} from "../src/lib/exam/mock-config";
import { buildMockFullPoolKey, buildMockSkillPoolKey } from "../src/lib/exam/practice-pool";

const db = new PrismaClient();

const LEVELS: ExamLevel[] = ["STARTERS", "MOVERS", "FLYERS", "KET", "PET", "FCE"];
const YLE = new Set<ExamLevel>(["STARTERS", "MOVERS", "FLYERS"]);

const SKILL_LABEL: Record<Skill, string> = {
  READING: "Reading",
  LISTENING: "Listening",
  WRITING: "Writing",
  SPEAKING: "Speaking",
  USE_OF_ENGLISH: "Use of English",
};

const LEVEL_LABEL: Record<ExamLevel, string> = {
  STARTERS: "Starters",
  MOVERS: "Movers",
  FLYERS: "Flyers",
  KET: "KET",
  PET: "PET",
  FCE: "FCE",
};

function mockSkills(level: ExamLevel): Skill[] {
  const base: Skill[] = [
    Skill.READING,
    Skill.LISTENING,
    Skill.WRITING,
    Skill.SPEAKING,
  ];
  if (!YLE.has(level)) base.push(Skill.USE_OF_ENGLISH);
  return base;
}

async function migrateSkillMocks() {
  let created = 0;
  let updated = 0;
  let unpublished = 0;

  for (const level of LEVELS) {
    for (const skill of mockSkills(level)) {
      const count = getMockSkillQuestionCount(level, skill);
      if (count === 0) continue;

      const poolKey = buildMockSkillPoolKey(level, skill);
      const title = `${LEVEL_LABEL[level]} ${SKILL_LABEL[skill]} Mock Test`;
      const poolSize = await db.question.count({
        where: { level, skill, placementSlug: null },
      });

      const existing = await db.examPaper.findUnique({
        where: { mockPoolKey: poolKey },
      });

      const description = `${count} câu ngẫu nhiên từ ngân hàng ${poolSize} câu — không lặp cho đến khi hết pool`;

      if (existing) {
        await db.examPaper.update({
          where: { id: existing.id },
          data: {
            title,
            description,
            published: true,
            isMockTest: true,
            paperKind: PaperKind.MOCK_SKILL,
            skill,
            timeLimit: skillMockTimeLimit(level, skill),
          },
        });
        updated++;
      } else {
        await db.examPaper.create({
          data: {
            title,
            description,
            level,
            skill,
            paperKind: PaperKind.MOCK_SKILL,
            mockPoolKey: poolKey,
            published: true,
            isMockTest: true,
            timeLimit: skillMockTimeLimit(level, skill),
          },
        });
        created++;
      }

      const result = await db.examPaper.updateMany({
        where: {
          level,
          skill,
          paperKind: PaperKind.MOCK_SKILL,
          mockPoolKey: null,
        },
        data: { published: false },
      });
      unpublished += result.count;

      console.log(`${poolKey}: ${count} câu · ngân hàng ${poolSize}`);
    }
  }

  return { created, updated, unpublished };
}

async function migrateFullMocks() {
  let created = 0;
  let updated = 0;
  let unpublished = 0;

  for (const level of LEVELS) {
    const poolKey = buildMockFullPoolKey(level);
    const format = getCambridgeMockFormat(level);
    const totalQuestions = fullMockQuestionCount(level);
    const sections = buildFullMockPaperSections(level);
    const title = format.paperTitle;
    const description = `${totalQuestions} câu ngẫu nhiên — ${cambridgeMockDescription(format)}`;

    const existing = await db.examPaper.findUnique({
      where: { mockPoolKey: poolKey },
    });

    if (existing) {
      await db.examPaper.update({
        where: { id: existing.id },
        data: {
          title,
          description,
          sections,
          published: true,
          isMockTest: true,
          paperKind: PaperKind.MOCK_FULL,
          skill: Skill.READING,
          timeLimit: cambridgeMockTotalSeconds(format),
        },
      });
      updated++;
    } else {
      await db.examPaper.create({
        data: {
          title,
          description,
          level,
          skill: Skill.READING,
          paperKind: PaperKind.MOCK_FULL,
          mockPoolKey: poolKey,
          sections,
          published: true,
          isMockTest: true,
          timeLimit: cambridgeMockTotalSeconds(format),
        },
      });
      created++;
    }

    const result = await db.examPaper.updateMany({
      where: {
        level,
        paperKind: PaperKind.MOCK_FULL,
        mockPoolKey: null,
      },
      data: { published: false },
    });
    unpublished += result.count;

    console.log(`${poolKey}: ${totalQuestions} câu · ${format.sections.length} phần thi`);
  }

  return { created, updated, unpublished };
}

async function main() {
  console.log("=== Mock kỹ năng ===\n");
  const skill = await migrateSkillMocks();
  console.log(
    `\nMock kỹ năng: ${skill.created} mới · ${skill.updated} cập nhật · ${skill.unpublished} đề cũ ẩn`
  );

  console.log("\n=== Full mock ===\n");
  const full = await migrateFullMocks();
  console.log(
    `\nFull mock: ${full.created} mới · ${full.updated} cập nhật · ${full.unpublished} đề cũ ẩn`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
