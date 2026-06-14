import { spawnSync } from "node:child_process";

const INIT_MIGRATION = "20250101000000_init";
const PAPER_KIND_MIGRATION = "20250613120000_paper_kind_sections";

function runPrisma(args, { inherit = false } = {}) {
  return spawnSync("npx", ["prisma", ...args], {
    encoding: "utf8",
    stdio: inherit ? "inherit" : "pipe",
    shell: true,
    env: process.env,
  });
}

function outputOf(result) {
  return `${result.stdout ?? ""}${result.stderr ?? ""}`;
}

function migrateDeploy() {
  if (process.env.VERCEL === "1") {
    console.log(
      "Skipping prisma migrate deploy on Vercel (Supabase direct port 5432 is unreachable from build). " +
        "Run `npm run db:deploy` locally when the schema changes."
    );
    return;
  }

  const result = runPrisma(["migrate", "deploy"]);
  const output = outputOf(result);

  if (result.status === 0) {
    if (output.trim()) process.stdout.write(output);
    return;
  }

  if (output.includes("P3005")) {
    console.log(
      "Database already has tables (from db push). Marking init migration as applied..."
    );
    const baseline = runPrisma(["migrate", "resolve", "--applied", INIT_MIGRATION], {
      inherit: true,
    });
    if (baseline.status !== 0) {
      process.exit(baseline.status ?? 1);
    }

    const retry = runPrisma(["migrate", "deploy"], { inherit: true });
    process.exit(retry.status ?? 1);
  }

  if (output.includes("P3018")) {
    console.log(
      "Migration failed previously. Marking as rolled back, then retrying..."
    );
    const rolled = runPrisma(
      ["migrate", "resolve", "--rolled-back", PAPER_KIND_MIGRATION],
      { inherit: true }
    );
    if (rolled.status !== 0) {
      process.exit(rolled.status ?? 1);
    }

    const retry = runPrisma(["migrate", "deploy"], { inherit: true });
    if (retry.status === 0) return;
    process.exit(retry.status ?? 1);
  }

  if (
    output.includes("PaperKind") &&
    output.includes("already exists")
  ) {
    console.log(
      "PaperKind enum already exists (from db push). Marking migration as applied..."
    );
    const resolve = runPrisma(
      ["migrate", "resolve", "--applied", PAPER_KIND_MIGRATION],
      { inherit: true }
    );
    if (resolve.status !== 0) {
      process.exit(resolve.status ?? 1);
    }
    return;
  }

  if (output.trim()) {
    process.stderr.write(output);
  }
  process.exit(result.status ?? 1);
}

migrateDeploy();
