/**
 * Generate MP3 files for Listening questions using edge-tts (Python).
 * Install: python -m pip install edge-tts
 * Usage: npm run audio:generate
 *
 * Safe: only writes missing files under public/audio/listening — does not modify DB.
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

function normalizeTranscriptForTts(transcript) {
  const trimmed = transcript.trim();
  if (!trimmed) return "";

  const speakerOnly = trimmed.match(/^Speaker:\s*['"]([^'"]+)['"]\.?$/i);
  if (speakerOnly) return speakerOnly[1].trim();

  const speakerLine = trimmed.match(/^Speaker:\s*['"]([^'"]+)['"]\.?\s*(.*)$/is);
  if (speakerLine) {
    return speakerLine[1].trim().slice(0, MAX_TTS_CHARS);
  }

  return trimmed.slice(0, MAX_TTS_CHARS);
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
        try {
          if (fs.existsSync(tmpDest)) fs.unlinkSync(tmpDest);
        } catch {
          /* ignore */
        }
        resolve({ ok: false, error: e instanceof Error ? e.message : "write failed" });
      }
    });

    child.on("error", (e) => resolve({ ok: false, error: e.message }));
  });
}

async function runPool(jobs, edgeTts, onProgress) {
  let created = 0;
  let failed = 0;
  let done = 0;
  const queue = [...jobs];

  async function worker() {
    while (queue.length > 0) {
      const job = queue.shift();
      if (!job) return;

      const { dest, transcript, rel, index, total } = job;
      const result = await generateMp3Async(transcript, dest, edgeTts);
      done++;

      if (result.ok) {
        created++;
      } else {
        failed++;
        console.log(`FAIL [${index}/${total}] ${rel}: ${result.error}`);
      }

      onProgress({ done, total, created, failed });
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

  console.log(
    `Dùng: ${edgeTts.cmd}${edgeTts.args.length ? " " + edgeTts.args.join(" ") : ""} (${CONCURRENCY} workers)`
  );

  const questions = await db.question.findMany({
    where: { skill: "LISTENING", audioUrl: { not: null } },
    select: { id: true, audioUrl: true, content: true },
    orderBy: [{ level: "asc" }, { id: "asc" }],
  });

  const jobsByDest = new Map();

  for (const q of questions) {
    const content = q.content;
    const raw =
      typeof content === "object" && content !== null && "transcript" in content
        ? String(content.transcript)
        : "";
    const transcript = normalizeTranscriptForTts(raw);
    if (!transcript || !q.audioUrl) continue;

    const dest = path.join(root, "public", q.audioUrl.replace(/^\//, ""));
    if (!jobsByDest.has(dest)) {
      jobsByDest.set(dest, { dest, transcript });
    }
  }

  const allJobs = [...jobsByDest.values()];
  const pending = allJobs.filter(({ dest }) => {
    if (!fs.existsSync(dest)) return true;
    try {
      return fs.statSync(dest).size < 500;
    } catch {
      return true;
    }
  });
  const skipped = allJobs.length - pending.length;

  console.log(
    `${questions.length} câu Listening → ${allJobs.length} file MP3 duy nhất (${skipped} đã có, ${pending.length} cần tạo)`
  );

  if (pending.length === 0) {
    console.log("Done: không có file mới cần tạo.");
    return;
  }

  const jobs = pending.map((job, i) => ({
    ...job,
    rel: path.relative(root, job.dest),
    index: i + 1,
    total: pending.length,
  }));

  let lastLog = 0;
  const { created, failed } = await runPool(jobs, edgeTts, ({ done, total, created: c, failed: f }) => {
    if (done - lastLog >= 50 || done === total) {
      lastLog = done;
      console.log(`  ${done}/${total} processed — ${c} created, ${f} failed`);
    }
  });

  console.log(
    `\nDone: ${created} created, ${skipped} skipped (already exist), ${failed} failed, ${allJobs.length} total paths`
  );

  if (failed > 0) process.exitCode = 1;
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
