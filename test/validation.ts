import assert from "node:assert/strict";
import test from "node:test";
import { cleanRoomDisclaimer, summarizeCheckIns } from "../src/core.js";
import { syntheticCheckIns } from "../src/seed.js";

test("summarizes synthetic check-ins", () => {
  const summary = summarizeCheckIns(syntheticCheckIns);

  assert.equal(summary.totalTeams, 3);
  assert.equal(summary.averageMoodScore, 74.7);
  assert.equal(summary.averageCoveragePercent, 91.7);
  assert.equal(summary.totalOpenFollowUps, 6);
  assert.deepEqual(summary.attentionTeams, ["River Desk"]);
  assert.equal(summary.disclaimer, cleanRoomDisclaimer);
});

test("seed data stays fictional and non-regulated", () => {
  const joined = syntheticCheckIns.map((item) => `${item.team} ${item.note}`).join(" ").toLowerCase();
  const disallowedTerms = ["patient", "diagnosis", "treatment", "claim", "ssn", "biometric"];

  for (const term of disallowedTerms) {
    assert.equal(joined.includes(term), false, `seed data should not include ${term}`);
  }
});

test("empty input returns a safe zero summary", () => {
  assert.deepEqual(summarizeCheckIns([]), {
    totalTeams: 0,
    averageMoodScore: 0,
    averageCoveragePercent: 0,
    totalOpenFollowUps: 0,
    attentionTeams: [],
    disclaimer: cleanRoomDisclaimer
  });
});
