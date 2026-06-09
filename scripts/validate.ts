import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { buildBeaconHealthReport, queues, renderReport } from "../src/index.ts";

const requiredFiles = ["PLAN.md", "README.md", "package.json", "tsconfig.json", "src/index.ts", "tests/beacon.test.ts"];
const forbiddenSeedPatterns = [/diagnos(?:e|is)/i, /treatment/i, /ssn/i, /\bmrn\b/i, /\bdob\b/i, /insurance/i, /claim/i, /@/, /555-/];

async function main(): Promise<void> {
  const repoRoot = new URL("..", import.meta.url).pathname;
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
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
    return;
  }

  console.log("Validation passed: operations beacon, synthetic data, and explicit non-regulated disclaimers are present.");
}

function validateSyntheticData(failures: string[]): void {
  if (queues.length < 3) failures.push("Expected at least three synthetic queues.");

  const joined = JSON.stringify(queues);
  for (const pattern of forbiddenSeedPatterns) {
    if (pattern.test(joined)) failures.push(`Seed data contains forbidden pattern: ${pattern}`);
  }
}

function validateReport(failures: string[]): void {
  const report = buildBeaconHealthReport();
  const rendered = renderReport(report);

  if (report.intake.length !== queues.length) failures.push("Report queue count does not match seed data.");
  if (report.intake.filter((card) => card.status === "red").length !== 1) failures.push("Expected exactly one synthetic red queue.");
  if (report.appointments.length < 3) failures.push("Expected synthetic appointment coordination cards.");
  if (report.coverage.length < 3) failures.push("Expected synthetic staffing coverage cards.");
  if (report.drafts.length < 2) failures.push("Expected synthetic assistant administrative drafts.");
  if (!rendered.includes("Do not use with PHI")) failures.push("Rendered report must prohibit PHI use.");
}

async function validateText(repoRoot: string, failures: string[]): Promise<void> {
  const files = await collectFiles(repoRoot, ["README.md", "PLAN.md", "src", "tests", "scripts"]);
  const readme = await readFile(join(repoRoot, "README.md"), "utf8").catch(() => "");
  const appOutput = await readFile(join(repoRoot, "src/index.ts"), "utf8").catch(() => "");

  for (const phrase of ["synthetic", "clean-room", "admin-only", "not medical advice", "not care coordination for real patients", "PHI", "no affiliation"]) {
    if (!readme.toLowerCase().includes(phrase.toLowerCase())) failures.push(`README missing required phrase: ${phrase}`);
  }

  if (!appOutput.includes("Not medical advice") || !appOutput.includes("Do not use with PHI")) {
    failures.push("CLI must print the clean-room non-regulated disclaimer.");
  }

  for (const file of files) {
    const text = await readFile(file, "utf8");
    if (/external service|scraped data|credential/i.test(text) && file.includes("src/")) {
      failures.push(`Potentially unsafe source wording in ${file}`);
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
