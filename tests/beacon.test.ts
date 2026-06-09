import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { describe, it } from "node:test";

import { buildBeacon, hourlyCapacity, loadRatio, queues, renderReport, statusFor } from "../src/index.ts";

describe("synthetic operations beacon", () => {
  it("calculates deterministic queue capacity and load", () => {
    assert.equal(hourlyCapacity(queues[0]), 23);
    assert.equal(loadRatio(queues[1]), 1.72);
  });

  it("assigns queue status bands from synthetic pressure", () => {
    assert.equal(statusFor(queues[0]), "green");
    assert.equal(statusFor(queues[1]), "red");
    assert.equal(statusFor(queues[2]), "green");
  });

  it("orders beacon cards by severity and load", () => {
    const cards = buildBeacon();

    assert.equal(cards.length, 4);
    assert.equal(cards[0]?.status, "red");
    assert.equal(cards[0]?.queue, "Scheduling callbacks");
  });

  it("keeps seed data synthetic and excludes obvious regulated identifiers", () => {
    const joined = JSON.stringify(queues).toLowerCase();
    const disallowedTerms = ["diagnosis", "treatment", "ssn", "mrn", "dob", "insurance", "claim", "@", "555-"];

    for (const term of disallowedTerms) {
      assert.equal(joined.includes(term), false, `seed data should not include ${term}`);
    }
  });

  it("renders explicit non-regulated disclaimers", () => {
    const output = renderReport();

    assert.match(output, /Not medical advice/i);
    assert.match(output, /not care coordination for real patients/i);
    assert.match(output, /Do not use with PHI/i);
  });

  it("runs the CLI directly through Node 22 TypeScript execution", () => {
    const output = execFileSync(process.execPath, ["src/index.ts"], { encoding: "utf8" });

    assert.match(output, /Beacon Health synthetic operations beacon/);
  });
});
