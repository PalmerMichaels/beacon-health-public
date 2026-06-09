#!/usr/bin/env node
import { pathToFileURL } from "node:url";

export type OpsQueue = {
  id: string;
  name: string;
  waitingItems: number;
  oldestMinutes: number;
  targetMinutes: number;
  staffedSlots: number;
  flexSlots: number;
  fallbackTeam: string;
};

export type BeaconCard = {
  queue: string;
  status: "green" | "amber" | "red";
  loadRatio: number;
  suggestion: string;
};

export const queues: OpsQueue[] = [
  {
    id: "forms",
    name: "Forms review desk",
    waitingItems: 18,
    oldestMinutes: 34,
    targetMinutes: 45,
    staffedSlots: 4,
    flexSlots: 1,
    fallbackTeam: "documentation pod",
  },
  {
    id: "scheduling",
    name: "Scheduling callbacks",
    waitingItems: 31,
    oldestMinutes: 82,
    targetMinutes: 50,
    staffedSlots: 3,
    flexSlots: 1,
    fallbackTeam: "front desk float",
  },
  {
    id: "supplies",
    name: "Supply coordination",
    waitingItems: 9,
    oldestMinutes: 28,
    targetMinutes: 40,
    staffedSlots: 2,
    flexSlots: 2,
    fallbackTeam: "ops runner",
  },
  {
    id: "records",
    name: "Records routing",
    waitingItems: 24,
    oldestMinutes: 61,
    targetMinutes: 55,
    staffedSlots: 4,
    flexSlots: 0,
    fallbackTeam: "admin lead",
  },
];

export function hourlyCapacity(queue: OpsQueue): number {
  return queue.staffedSlots * 5 + queue.flexSlots * 3;
}

export function loadRatio(queue: OpsQueue): number {
  return Number((queue.waitingItems / hourlyCapacity(queue)).toFixed(2));
}

export function statusFor(queue: OpsQueue): BeaconCard["status"] {
  const load = loadRatio(queue);
  const ageRatio = queue.oldestMinutes / queue.targetMinutes;

  if (ageRatio <= 1 && load <= 1) return "green";
  if (ageRatio <= 1.35 && load <= 1.35) return "amber";
  return "red";
}

export function suggestionFor(queue: OpsQueue): string {
  const status = statusFor(queue);

  if (status === "green") return "hold current staffing and recheck at next operations huddle";
  if (status === "amber") return `borrow one flex slot from ${queue.fallbackTeam} if the next batch grows`;
  return `escalate to ${queue.fallbackTeam} for operational load balancing`;
}

export function buildBeacon(source: OpsQueue[] = queues): BeaconCard[] {
  const severity = { red: 0, amber: 1, green: 2 } as const;

  return source
    .map((queue) => ({
      queue: queue.name,
      status: statusFor(queue),
      loadRatio: loadRatio(queue),
      suggestion: suggestionFor(queue),
    }))
    .sort((left, right) => severity[left.status] - severity[right.status] || right.loadRatio - left.loadRatio);
}

export function renderReport(cards: BeaconCard[] = buildBeacon()): string {
  const lines = [
    "Beacon Health synthetic operations beacon",
    "Clean-room demo: fictional staffing queues only. Not medical advice, not care coordination for real patients, not diagnosis, treatment, triage, billing, HIPAA/PHI handling, clinical decision support, or a diagnostic device. Not for clinical decisions. Do not use with PHI.",
  ];

  for (const card of cards) {
    lines.push(`- ${card.queue} | ${card.status} | load ${card.loadRatio}x | ${card.suggestion}`);
  }

  return lines.join("\n");
}

export function main(): void {
  console.log(renderReport());
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === invokedPath) main();
