import { spawnSync } from "node:child_process";

const MIGRATION_NAME = "20250101000000_init";

function runPrisma(args, { inherit = false } = {}) {
  return spawnSync("npx", ["prisma", ...args], {
    encoding: "utf8",
    stdio: inherit ? "inherit" : "pipe",
    shell: true,
    env: process.env,
  });
}

function migrateDeploy() {
  const result = runPrisma(["migrate", "deploy"]);
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;

  if (result.status === 0) {
    if (output.trim()) process.stdout.write(output);
    return;
  }

  if (output.includes("P3005")) {
    console.log(
      "Database already has tables (from db push). Marking migration as applied..."
    );
    const baseline = runPrisma(["migrate", "resolve", "--applied", MIGRATION_NAME], {
      inherit: true,
    });
    if (baseline.status !== 0) {
      process.exit(baseline.status ?? 1);
    }

    const retry = runPrisma(["migrate", "deploy"], { inherit: true });
    process.exit(retry.status ?? 1);
  }

  if (output.trim()) {
    process.stderr.write(output);
  }
  process.exit(result.status ?? 1);
}

migrateDeploy();
