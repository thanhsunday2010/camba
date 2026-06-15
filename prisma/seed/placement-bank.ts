import { PrismaClient, Skill } from "@prisma/client";
import {
  PLACEMENT_SLUG_BY_TITLE,
  type PlacementPool,
} from "../../src/lib/placement/placement-config";
import type { PlacementSectionPool, PlacementTestContent } from "./placement-content";
import { getPlacementTests } from "./placement-content";
import {
  PLACEMENT_BANK_FORMS,
  variantGaps,
  variantListenings,
  variantMcqs,
  variantSpeakings,
  variantWritings,
} from "./placement-bank-variants";
import {
  createGaps,
  createListenings,
  createMcqs,
  createSpeakings,
  createWritings,
  type QuestionBankMeta,
} from "./helpers";

function bankMeta(slug: string, pool: PlacementPool): QuestionBankMeta {
  return { placementSlug: slug, placementPool: pool };
}

async function seedFormPools(
  db: PrismaClient,
  test: PlacementTestContent,
  slug: string,
  formIndex: number
) {
  const tag = formIndex + 1;
  const reading = variantMcqs(test.reading, formIndex);
  const listening = variantListenings(test.listening, formIndex).map((item, i) => ({
    ...item,
    audioSlug: `placement-${slug}-f${tag}-${String(i + 1).padStart(3, "0")}`,
  }));

  await createMcqs(
    db,
    test.level,
    Skill.READING,
    reading,
    bankMeta(slug, "reading")
  );

  await createListenings(
    db,
    test.level,
    listening,
    500,
    bankMeta(slug, "listening")
  );

  if (test.grammarMcq?.length) {
    await createMcqs(
      db,
      test.level,
      Skill.USE_OF_ENGLISH,
      variantMcqs(test.grammarMcq, formIndex),
      bankMeta(slug, "grammarMcq")
    );
  } else if (test.grammar.length) {
    await createGaps(
      db,
      test.level,
      variantGaps(test.grammar, formIndex),
      bankMeta(slug, "grammar")
    );
  }

  if (test.writing?.length) {
    await createWritings(
      db,
      test.level,
      variantWritings(test.writing, formIndex),
      bankMeta(slug, "writing")
    );
  }

  if (test.speaking?.length) {
    await createSpeakings(
      db,
      test.level,
      variantSpeakings(test.speaking, formIndex),
      bankMeta(slug, "speaking")
    );
  }
}

export function poolCountForTest(
  test: PlacementTestContent,
  pool: PlacementSectionPool
): number {
  switch (pool) {
    case "reading":
      return test.reading.length;
    case "listening":
      return test.listening.length;
    case "grammarMcq":
      return test.grammarMcq?.length ?? 0;
    case "grammar":
      return test.grammar.length;
    case "writing":
      return test.writing?.length ?? 0;
    case "speaking":
      return test.speaking?.length ?? 0;
    default:
      return 0;
  }
}

export async function seedPlacementQuestionBank(db: PrismaClient) {
  console.log("Seeding placement question bank (3 forms × 7 placements)…");

  for (const test of getPlacementTests()) {
    const slug = PLACEMENT_SLUG_BY_TITLE[test.title];
    if (!slug) {
      throw new Error(`Missing placement slug for "${test.title}"`);
    }

    for (let formIndex = 0; formIndex < PLACEMENT_BANK_FORMS; formIndex++) {
      await seedFormPools(db, test, slug, formIndex);
    }

    const perForm =
      test.reading.length +
      test.listening.length +
      (test.grammarMcq?.length ?? test.grammar.length) +
      (test.writing?.length ?? 0) +
      (test.speaking?.length ?? 0);

    console.log(
      `  ✓ bank ${slug}: ${perForm * PLACEMENT_BANK_FORMS} câu (${PLACEMENT_BANK_FORMS} forms)`
    );
  }
}
