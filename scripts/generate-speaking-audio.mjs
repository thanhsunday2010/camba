/**
 * Generate MP3 for Speaking questions + set audioUrl on Question rows.
 * Usage: npm run audio:generate-speaking
 */
import { PrismaClient } from "@prisma/client";
import { execSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const db = new PrismaClient();

const MAX_TTS_CHARS = 3000;
const VOICE = "en-GB-SoniaNeural";
const CONCURRENCY = 8;

const EDGE_TTS_CANDIDATES = [
  { cmd: "edge-tts", args: [] },
  { cmd: "python", args: ["-m", "edge_tts"] },
  { cmd: "py", args: ["-m", "edge_tts"] },
];

function resolveEdgeTts() {
  for (const candidate of EDGE_TTS_CANDIDATES) {
    try {
      execSync([candidate.cmd, ...candidate.args, "--version"].join(" "), {
        stdio: "ignore",
        shell: true,
      });
      return candidate;
    } catch {
      /* try next */
    }
  }
  return null;
}

function getSpeakingPromptText(content) {
  if (!content || typeof content !== "object") return "";
  const c = content;
  const raw = (typeof c.script === "string" ? c.script : "") || (typeof c.prompt === "string" ? c.prompt : "");
  return raw.replace(/^\[[^\]]+\]\s*/, "").trim().slice(0, MAX_TTS_CHARS);
}

function buildSpeakingAudioUrl(level, questionId) {
  return `/audio/speaking/${level}/${questionId}.mp3`;
}

function generateMp3Async(text, dest, edgeTts) {
  return new Promise((resolve) => {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const tmpDest = `${dest}.tmp-${process.pid}-${Date.now()}`;

    const child = spawn(
      edgeTts.cmd,
      [...edgeTts.args, "--text", text, "--write-media", tmpDest, "--voice", VOICE],
      { stdio: "pipe", windowsHide: true }
    );

    let stderr = "";
    child.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("close", (code) => {
      if (code !== 0 || !fs.existsSync(tmpDest)) {
        try {
          if (fs.existsSync(tmpDest)) fs.unlinkSync(tmpDest);
        } catch {
          /* ignore */
        }
        resolve({ ok: false, error: stderr.trim().slice(0, 200) || `exit ${code}` });
        return;
      }
      try {
        const size = fs.statSync(tmpDest).size;
        if (size < 500) {
          fs.unlinkSync(tmpDest);
          resolve({ ok: false, error: "file too small" });
          return;
        }
        fs.renameSync(tmpDest, dest);
        resolve({ ok: true });
      } catch (e) {
        resolve({ ok: false, error: e instanceof Error ? e.message : "write failed" });
      }
    });

    child.on("error", (e) => resolve({ ok: false, error: e.message }));
  });
}

async function runPool(jobs, edgeTts) {
  let created = 0;
  let failed = 0;
  const queue = [...jobs];

  async function worker() {
    while (queue.length > 0) {
      const job = queue.shift();
      if (!job) return;

      const result = await generateMp3Async(job.text, job.dest, edgeTts);
      if (result.ok) {
        created++;
        if (job.questionId) {
          await db.question.update({
            where: { id: job.questionId },
            data: { audioUrl: job.audioUrl },
          });
        }
      } else {
        failed++;
        console.log(`FAIL ${job.rel}: ${result.error}`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  return { created, failed };
}

async function main() {
  const edgeTts = resolveEdgeTts();
  if (!edgeTts) {
    console.log("edge-tts chưa cài. Chạy: python -m pip install edge-tts");
    process.exit(1);
  }

  const questions = await db.question.findMany({
    where: { type: "SPEAKING_PROMPT" },
    select: { id: true, level: true, content: true, audioUrl: true },
    orderBy: [{ level: "asc" }, { id: "asc" }],
  });

  const jobs = [];
  for (const q of questions) {
    const text = getSpeakingPromptText(q.content);
    if (!text) continue;

    const audioUrl = buildSpeakingAudioUrl(q.level, q.id);
    const dest = path.join(root, "public", audioUrl.replace(/^\//, ""));

    const needsFile =
      !fs.existsSync(dest) ||
      (() => {
        try {
          return fs.statSync(dest).size < 500;
        } catch {
          return true;
        }
      })();

    const needsUrl = q.audioUrl !== audioUrl;

    if (needsFile || needsUrl) {
      jobs.push({
        questionId: q.id,
        audioUrl,
        text,
        dest,
        rel: path.relative(root, dest),
      });
    }
  }

  console.log(`${questions.length} câu Speaking · ${jobs.length} cần tạo/cập nhật MP3`);

  if (jobs.length === 0) {
    console.log("Done: không có file mới.");
    return;
  }

  const { created, failed } = await runPool(jobs, edgeTts);
  console.log(`\nDone: ${created} MP3 created/updated · ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
