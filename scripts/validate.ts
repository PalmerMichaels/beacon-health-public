import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { buildReadinessReport } from "../src/readiness.js";
import { syntheticAppointmentSlots } from "../src/seed.js";

const requiredFiles = ["PLAN.md", "README.md", "package.json", "tsconfig.json", "src/index.ts", "src/readiness.ts", "src/seed.ts", "tests/beacon.test.ts"];
const forbiddenSeedPatterns = [/diagnos(?:e|is)/i, /treatment/i, /ssn/i, /\bmrn\b/i, /\bdob\b/i, /insurance/i, /claim/i, /@/, /555-/];

async function main(): Promise<void> {
  const repoRoot = process.cwd();
  const failures: string[] = [];

  for (const file of requiredFiles) {
    try {
      await readFile(join(repoRoot, file), "utf8");
    } catch {
      failures.push(`Missing required file: ${file}`);
    }
  }

  validateSyntheticData(failures);
  validateReport(failures);
  await validateText(repoRoot, failures);

  if (failures.length > 0) {
    console.error("Validation failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("Validation passed: appointment readiness beacon, synthetic data, and explicit non-regulated disclaimers are present.");
}

function validateSyntheticData(failures: string[]): void {
  if (syntheticAppointmentSlots.length < 3) {
    failures.push("Expected at least three synthetic appointment slots.");
  }

  const joined = JSON.stringify(syntheticAppointmentSlots);

  for (const pattern of forbiddenSeedPatterns) {
    if (pattern.test(joined)) {
      failures.push(`Seed data contains forbidden pattern: ${pattern}`);
    }
  }
}

function validateReport(failures: string[]): void {
  const report = buildReadinessReport(syntheticAppointmentSlots);

  if (report.totalSlots !== syntheticAppointmentSlots.length) {
    failures.push("Report slot count does not match seed data.");
  }
  if (report.actionCount !== 1) {
    failures.push("Expected exactly one synthetic slot in action band.");
  }
  if (!report.disclaimer.includes("Do not use with PHI")) {
    failures.push("Report disclaimer must prohibit PHI use.");
  }
}

async function validateText(repoRoot: string, failures: string[]): Promise<void> {
  const files = await collectFiles(repoRoot, ["README.md", "PLAN.md", "src", "tests", "scripts"]);
  const readme = await readFile(join(repoRoot, "README.md"), "utf8").catch(() => "");
  const appOutput = await readFile(join(repoRoot, "src/index.ts"), "utf8").catch(() => "");

  for (const phrase of ["synthetic", "clean-room", "not medical advice", "not care coordination for real patients", "PHI", "no affiliation"]) {
    if (!readme.toLowerCase().includes(phrase.toLowerCase())) {
      failures.push(`README missing required phrase: ${phrase}`);
    }
  }

  if (!appOutput.includes("cleanRoomDisclaimer")) {
    failures.push("CLI must print the shared clean-room disclaimer.");
  }

  for (const file of files) {
    const text = await readFile(file, "utf8");
    if (/external service|scraped data|credential/i.test(text) && file.endsWith("src/seed.ts")) {
      failures.push(`Potentially unsafe seed wording in ${file}`);
    }
  }
}

async function collectFiles(repoRoot: string, entries: string[]): Promise<string[]> {
  const files: string[] = [];

  for (const entry of entries) {
    const path = join(repoRoot, entry);
    if (entry.endsWith(".md")) {
      files.push(path);
      continue;
    }

    for (const child of await readdir(path, { withFileTypes: true }).catch(() => [])) {
      const childPath = join(path, child.name);
      if (child.isDirectory()) {
        files.push(...await collectFiles(repoRoot, [join(entry, child.name)]));
      } else if (child.name.endsWith(".ts")) {
        files.push(childPath);
      }
    }
  }

  return files;
}

await main();
