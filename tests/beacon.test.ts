import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { describe, it } from "node:test";

import { buildReadinessReport, cleanRoomDisclaimer, evaluateSlot } from "../src/readiness.js";
import { syntheticAppointmentSlots } from "../src/seed.js";

describe("appointment readiness beacon", () => {
  it("builds deterministic totals from synthetic appointment slots", () => {
    const report = buildReadinessReport(syntheticAppointmentSlots, "Validation Schedule");

    assert.equal(report.generatedFor, "Validation Schedule");
    assert.equal(report.totalSlots, 4);
    assert.equal(report.readyCount, 1);
    assert.equal(report.watchCount, 2);
    assert.equal(report.actionCount, 1);
    assert.equal(report.totalOpenTasks, 4);
    assert.equal(report.transportNeeds, 2);
    assert.equal(report.reminderGaps, 2);
    assert.equal(report.disclaimer, cleanRoomDisclaimer);
  });

  it("prioritizes high-priority fictional outreach before lower priority gaps", () => {
    const slot = evaluateSlot(syntheticAppointmentSlots[1]);

    assert.equal(slot.readinessScore, 42);
    assert.equal(slot.band, "action");
    assert.equal(slot.nextAction, "Call fictional contact to confirm arrival preference");
    assert.deepEqual(slot.openTasks.map((task) => task.priority), ["high", "medium"]);
  });

  it("marks a complete synthetic slot as ready", () => {
    const slot = evaluateSlot(syntheticAppointmentSlots[0]);

    assert.equal(slot.readinessScore, 100);
    assert.equal(slot.band, "ready");
    assert.equal(slot.nextAction, "No readiness task required");
  });

  it("keeps seed data synthetic and excludes obvious regulated identifiers", () => {
    const joined = JSON.stringify(syntheticAppointmentSlots).toLowerCase();
    const disallowedTerms = ["diagnosis", "treatment", "ssn", "mrn", "dob", "insurance", "claim", "@", "555-"];

    for (const term of disallowedTerms) {
      assert.equal(joined.includes(term), false, `seed data should not include ${term}`);
    }
  });

  it("renders explicit non-regulated disclaimers in CLI output", () => {
    const output = execFileSync(process.execPath, ["dist/src/index.js"], { encoding: "utf8" });

    assert.match(output, /Not medical advice/i);
    assert.match(output, /not .*care coordination for real patients/i);
    assert.match(output, /Do not use with PHI/i);
  });
});
