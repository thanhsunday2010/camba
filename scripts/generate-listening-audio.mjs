/**
 * Generate MP3 files for Listening questions using edge-tts (Python).
 * Install: pip install edge-tts
 * Usage: npm run audio:generate
 */
import { PrismaClient } from "@prisma/client";
import { execSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const db = new PrismaClient();

function hasEdgeTts() {
  try {
    execSync("edge-tts --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function generateMp3(text, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const safe = text.replace(/"/g, '\\"').slice(0, 500);
  const result = spawnSync(
    "edge-tts",
    [
      "--text",
      safe,
      "--write-media",
      dest,
      "--voice",
      "en-GB-SoniaNeural",
    ],
    { stdio: "pipe", shell: true }
  );
  return result.status === 0 && fs.existsSync(dest);
}

async function main() {
  if (!hasEdgeTts()) {
    console.log("edge-tts chưa cài. Chạy: pip install edge-tts");
    console.log("Ứng dụng vẫn phát audio qua TTS trình duyệt nếu chưa có MP3.");
    process.exit(0);
  }

  const questions = await db.question.findMany({
    where: { skill: "LISTENING", audioUrl: { not: null } },
    select: { id: true, audioUrl: true, content: true },
  });

  let created = 0;
  let skipped = 0;

  for (const q of questions) {
    const content = q.content;
    const transcript =
      typeof content === "object" && content !== null && "transcript" in content
        ? String(content.transcript)
        : null;
    if (!transcript || !q.audioUrl) continue;

    const dest = path.join(root, "public", q.audioUrl.replace(/^\//, ""));
    if (fs.existsSync(dest)) {
      skipped++;
      continue;
    }

    if (generateMp3(transcript, dest)) {
      created++;
      if (created % 20 === 0) console.log(`  ${created} files...`);
    }
  }

  console.log(`Done: ${created} created, ${skipped} skipped (already exist), ${questions.length} total`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
