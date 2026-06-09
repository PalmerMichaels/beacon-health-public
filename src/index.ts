#!/usr/bin/env node
import { pathToFileURL } from "node:url";

type Status = "green" | "amber" | "red";

export type IntakeAdminItem = {
  id: string;
  desk: string;
  channel: "portal" | "front-desk" | "phone-log";
  waitingItems: number;
  oldestMinutes: number;
  targetMinutes: number;
  checklistComplete: number;
  checklistTotal: number;
  fallbackTeam: string;
};

export type AppointmentTask = {
  id: string;
  label: string;
  owner: string;
  openTasks: number;
  dueMinutes: number;
  documentStatus: "complete" | "missing-signature" | "needs-scan" | "queued-review";
  reminderDraftNeeded: boolean;
};

export type StaffingCoverage = {
  team: string;
  scheduledSlots: number;
  backupSlots: number;
  expectedAdminLoad: number;
  coverageWindow: string;
};

export type AssistantDraft = {
  id: string;
  audience: "front-desk" | "admin-lead" | "guest";
  purpose: string;
  body: string;
};

export type BeaconCard = {
  queue: string;
  status: Status;
  loadRatio: number;
  suggestion: string;
};

export type AppointmentCoordinationCard = {
  label: string;
  owner: string;
  adminScore: number;
  documentStatus: AppointmentTask["documentStatus"];
  nextAdminAction: string;
};

export type CoverageCard = {
  team: string;
  coverageRatio: number;
  status: Status;
  note: string;
};

export type BeaconHealthReport = {
  intake: BeaconCard[];
  appointments: AppointmentCoordinationCard[];
  coverage: CoverageCard[];
  drafts: AssistantDraft[];
  disclaimer: string;
};

export const cleanRoomDisclaimer =
  "Clean-room admin-only demo with synthetic primary-care operations data. Not medical advice, diagnosis, treatment, triage, clinical decision support, medical-device behavior, billing support, HIPAA/PHI handling, and not care coordination for real patients. Do not use with PHI, real patient data, or real integrations.";

export const queues: IntakeAdminItem[] = [
  {
    id: "intake-forms",
    desk: "Intake forms desk",
    channel: "portal",
    waitingItems: 18,
    oldestMinutes: 34,
    targetMinutes: 45,
    checklistComplete: 5,
    checklistTotal: 6,
    fallbackTeam: "documentation pod"
  },
  {
    id: "appointment-callbacks",
    desk: "Appointment callback desk",
    channel: "phone-log",
    waitingItems: 31,
    oldestMinutes: 82,
    targetMinutes: 50,
    checklistComplete: 3,
    checklistTotal: 5,
    fallbackTeam: "front desk float"
  },
  {
    id: "document-scan",
    desk: "Document scan desk",
    channel: "front-desk",
    waitingItems: 9,
    oldestMinutes: 28,
    targetMinutes: 40,
    checklistComplete: 4,
    checklistTotal: 4,
    fallbackTeam: "admin runner"
  },
  {
    id: "records-routing",
    desk: "Records routing desk",
    channel: "portal",
    waitingItems: 24,
    oldestMinutes: 61,
    targetMinutes: 55,
    checklistComplete: 5,
    checklistTotal: 7,
    fallbackTeam: "admin lead"
  }
];

export const appointmentTasks: AppointmentTask[] = [
  {
    id: "appt-demo-1001",
    label: "Tue 09:00 synthetic annual paperwork slot",
    owner: "Front desk A",
    openTasks: 0,
    dueMinutes: 120,
    documentStatus: "complete",
    reminderDraftNeeded: false
  },
  {
    id: "appt-demo-1002",
    label: "Tue 10:30 synthetic new-visit packet slot",
    owner: "Front desk B",
    openTasks: 3,
    dueMinutes: 45,
    documentStatus: "missing-signature",
    reminderDraftNeeded: true
  },
  {
    id: "appt-demo-1003",
    label: "Tue 13:15 synthetic follow-up paperwork slot",
    owner: "Admin coordinator",
    openTasks: 1,
    dueMinutes: 75,
    documentStatus: "needs-scan",
    reminderDraftNeeded: true
  },
  {
    id: "appt-demo-1004",
    label: "Tue 15:45 synthetic forms pickup slot",
    owner: "Front desk C",
    openTasks: 2,
    dueMinutes: 160,
    documentStatus: "queued-review",
    reminderDraftNeeded: false
  }
];

export const staffingCoverage: StaffingCoverage[] = [
  { team: "Front desk", scheduledSlots: 5, backupSlots: 1, expectedAdminLoad: 34, coverageWindow: "08:00-12:00" },
  { team: "Documentation pod", scheduledSlots: 3, backupSlots: 2, expectedAdminLoad: 21, coverageWindow: "09:00-14:00" },
  { team: "Admin callbacks", scheduledSlots: 2, backupSlots: 1, expectedAdminLoad: 28, coverageWindow: "10:00-16:00" }
];

export function hourlyCapacity(queue: IntakeAdminItem): number {
  return queue.checklistTotal * 3 + queue.checklistComplete;
}

export function loadRatio(queue: IntakeAdminItem): number {
  return Number((queue.waitingItems / hourlyCapacity(queue)).toFixed(2));
}

export function statusFor(queue: IntakeAdminItem): Status {
  const load = loadRatio(queue);
  const ageRatio = queue.oldestMinutes / queue.targetMinutes;
  const checklistRatio = queue.checklistComplete / queue.checklistTotal;

  if (ageRatio <= 1 && load <= 1 && checklistRatio >= 0.8) return "green";
  if (ageRatio <= 1.35 && load <= 1.35 && checklistRatio >= 0.65) return "amber";
  return "red";
}

export function suggestionFor(queue: IntakeAdminItem): string {
  const status = statusFor(queue);

  if (status === "green") return "hold current admin staffing and recheck at the next operations huddle";
  if (status === "amber") return `borrow one admin coverage slot from ${queue.fallbackTeam} if the next batch grows`;
  return `route overflow to ${queue.fallbackTeam} for non-clinical administrative load balancing`;
}

export function buildBeacon(source: IntakeAdminItem[] = queues): BeaconCard[] {
  const adminOrder = { red: 0, amber: 1, green: 2 } as const;

  return source
    .map((queue) => ({
      queue: `${queue.desk} (${queue.channel})`,
      status: statusFor(queue),
      loadRatio: loadRatio(queue),
      suggestion: suggestionFor(queue)
    }))
    .sort((left, right) => adminOrder[left.status] - adminOrder[right.status] || right.loadRatio - left.loadRatio);
}

export function appointmentAdminScore(task: AppointmentTask): number {
  const taskPenalty = task.openTasks * 18;
  const duePenalty = task.dueMinutes < 60 ? 20 : task.dueMinutes < 120 ? 10 : 0;
  const documentPenalty = task.documentStatus === "complete" ? 0 : task.documentStatus === "queued-review" ? 8 : 16;
  const reminderPenalty = task.reminderDraftNeeded ? 6 : 0;

  return Math.max(0, 100 - taskPenalty - duePenalty - documentPenalty - reminderPenalty);
}

export function buildAppointmentCoordination(tasks: AppointmentTask[] = appointmentTasks): AppointmentCoordinationCard[] {
  return tasks
    .map((task) => ({
      label: task.label,
      owner: task.owner,
      adminScore: appointmentAdminScore(task),
      documentStatus: task.documentStatus,
      nextAdminAction: nextAppointmentAction(task)
    }))
    .sort((left, right) => left.adminScore - right.adminScore || left.label.localeCompare(right.label));
}

export function buildCoverageCards(coverage: StaffingCoverage[] = staffingCoverage): CoverageCard[] {
  return coverage
    .map((team) => {
      const capacity = team.scheduledSlots * 8 + team.backupSlots * 4;
      const coverageRatio = Number((capacity / team.expectedAdminLoad).toFixed(2));
      const status: Status = coverageRatio >= 1.1 ? "green" : coverageRatio >= 0.85 ? "amber" : "red";

      return {
        team: team.team,
        coverageRatio,
        status,
        note: `${team.coverageWindow}: ${team.scheduledSlots} scheduled admin slots and ${team.backupSlots} backup slots`
      };
    })
    .sort((left, right) => left.coverageRatio - right.coverageRatio || left.team.localeCompare(right.team));
}

export function buildAssistantDrafts(tasks: AppointmentTask[] = appointmentTasks): AssistantDraft[] {
  return tasks
    .filter((task) => task.reminderDraftNeeded || task.documentStatus !== "complete")
    .map((task) => ({
      id: `draft-${task.id}`,
      audience: task.reminderDraftNeeded ? "guest" : "front-desk",
      purpose: `Administrative reminder for ${task.label}`,
      body: `Admin-only draft: please review the synthetic paperwork checklist for ${task.label}. This message contains no medical guidance and should not include PHI.`
    }));
}

export function buildBeaconHealthReport(): BeaconHealthReport {
  return {
    intake: buildBeacon(),
    appointments: buildAppointmentCoordination(),
    coverage: buildCoverageCards(),
    drafts: buildAssistantDrafts(),
    disclaimer: cleanRoomDisclaimer
  };
}

export function renderReport(report: BeaconHealthReport = buildBeaconHealthReport()): string {
  const lines = ["Beacon Health synthetic admin operations console", report.disclaimer, "", "Intake admin:"];

  for (const card of report.intake) {
    lines.push(`- ${card.queue} | ${card.status} | load ${card.loadRatio}x | ${card.suggestion}`);
  }

  lines.push("", "Appointment and task coordination:");
  for (const appointment of report.appointments) {
    lines.push(
      `- ${appointment.label} | owner ${appointment.owner} | admin score ${appointment.adminScore} | docs ${appointment.documentStatus} | ${appointment.nextAdminAction}`
    );
  }

  lines.push("", "Staffing coverage:");
  for (const coverage of report.coverage) {
    lines.push(`- ${coverage.team} | ${coverage.status} | coverage ${coverage.coverageRatio}x | ${coverage.note}`);
  }

  lines.push("", "Mock assistant administrative drafts:");
  for (const draft of report.drafts) {
    lines.push(`- ${draft.purpose} | audience ${draft.audience} | ${draft.body}`);
  }

  return lines.join("\n");
}

function nextAppointmentAction(task: AppointmentTask): string {
  if (task.documentStatus === "missing-signature") return "send admin-only signature reminder draft";
  if (task.documentStatus === "needs-scan") return "scan synthetic document packet and update checklist";
  if (task.openTasks > 0) return "close open administrative checklist items";
  return "no administrative task required";
}

export function main(): void {
  console.log(renderReport());
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === invokedPath) main();
