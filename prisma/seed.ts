import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedAllBulkContent } from "./seed/bulk-seed";
import { seedPlacementTests } from "./seed/helpers";
import { seedAdminRoles } from "./seed/admin-roles";
import { seedPromoCodes } from "./seed/promo-codes";
import {
  BANK_TRANSFER_SETTING_KEY,
  DEFAULT_BANK_TRANSFER_SETTINGS,
} from "../src/lib/payment/bank-transfer-settings";

const db = new PrismaClient();

async function main() {
  console.log("Seeding Camba database (curated Cambridge-style content)...");

  const adminHash = await bcrypt.hash("admin123", 10);
  const teacherHash = await bcrypt.hash("teacher123", 10);
  const studentHash = await bcrypt.hash("student123", 10);

  await db.user.upsert({
    where: { email: "admin@camba.vn" },
    update: { role: "ADMIN" },
    create: {
      email: "admin@camba.vn",
      name: "Admin Camba",
      passwordHash: adminHash,
      role: "ADMIN",
      targetExam: "KET",
    },
  });

  await seedAdminRoles(db);
  await seedPromoCodes(db);

  await db.siteSetting.upsert({
    where: { key: BANK_TRANSFER_SETTING_KEY },
    update: {},
    create: {
      key: BANK_TRANSFER_SETTING_KEY,
      value: DEFAULT_BANK_TRANSFER_SETTINGS,
    },
  });

  await db.user.upsert({
    where: { email: "teacher@camba.vn" },
    update: {},
    create: {
      email: "teacher@camba.vn",
      name: "Cô Lan",
      passwordHash: teacherHash,
      role: "TEACHER",
      targetExam: "PET",
    },
  });

  await db.user.upsert({
    where: { email: "student@camba.vn" },
    update: {},
    create: {
      email: "student@camba.vn",
      name: "Nguyễn Minh",
      passwordHash: studentHash,
      role: "STUDENT",
      grade: "Lớp 8",
      targetExam: "KET",
      streak: 3,
    },
  });

  await db.assignment.deleteMany({});
  await db.question.deleteMany({});
  await db.examPaper.deleteMany({});

  await seedAllBulkContent(db);
  await seedPlacementTests(db);

  const [paperCount, questionCount, mockCount, fullMockCount, placementCount] =
    await Promise.all([
      db.examPaper.count(),
      db.question.count(),
      db.examPaper.count({ where: { isMockTest: true } }),
      db.examPaper.count({ where: { paperKind: "MOCK_FULL" } }),
      db.examPaper.count({ where: { paperKind: "PLACEMENT" } }),
    ]);

  const teacher = await db.user.findUnique({ where: { email: "teacher@camba.vn" } });
  const student = await db.user.findUnique({ where: { email: "student@camba.vn" } });
  const ketFullMock = await db.examPaper.findFirst({
    where: { level: "KET", paperKind: "MOCK_FULL" },
  });

  if (teacher && student && ketFullMock) {
    await db.assignment.create({
      data: {
        paperId: ketFullMock.id,
        teacherId: teacher.id,
        studentId: student.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log("\nSeed complete!");
  console.log(`  Papers: ${paperCount} (${mockCount} mock, ${fullMockCount} full mock, ${placementCount} placement)`);
  console.log(`  Questions: ${questionCount}`);
  console.log(`  Levels: STARTERS, MOVERS, FLYERS, KET, PET, FCE`);
  console.log("\nChạy thêm: npm run audio:generate — tạo file MP3 listening");
  console.log("\nDemo accounts:");
  console.log("  Admin:   admin@camba.vn / admin123");
  console.log("  Teacher: teacher@camba.vn / teacher123");
  console.log("  Student: student@camba.vn / student123");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
