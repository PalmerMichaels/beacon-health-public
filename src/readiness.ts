import type { AppointmentSlot, ReadinessTask } from "./seed.js";

export type ReadinessBand = "ready" | "watch" | "action";

export type AppointmentReadiness = {
  slotId: string;
  label: string;
  readinessScore: number;
  band: ReadinessBand;
  openTasks: ReadinessTask[];
  transportNeed: string;
  reminderGap: string;
  nextAction: string;
};

export type BeaconReport = {
  generatedFor: string;
  totalSlots: number;
  readyCount: number;
  watchCount: number;
  actionCount: number;
  totalOpenTasks: number;
  transportNeeds: number;
  reminderGaps: number;
  slots: AppointmentReadiness[];
  disclaimer: string;
};

export const cleanRoomDisclaimer =
  "Clean-room synthetic demo only. Not medical advice, diagnosis, treatment, triage, billing support, clinical decision support, a diagnostic device, HIPAA/PHI handling, or care coordination for real patients. Not for clinical decisions. Do not use with PHI.";

export function buildReadinessReport(slots: AppointmentSlot[], generatedFor = "Demo Day"): BeaconReport {
  const evaluatedSlots = slots.map(evaluateSlot);

  return {
    generatedFor,
    totalSlots: evaluatedSlots.length,
    readyCount: evaluatedSlots.filter((slot) => slot.band === "ready").length,
    watchCount: evaluatedSlots.filter((slot) => slot.band === "watch").length,
    actionCount: evaluatedSlots.filter((slot) => slot.band === "action").length,
    totalOpenTasks: evaluatedSlots.reduce((sum, slot) => sum + slot.openTasks.length, 0),
    transportNeeds: evaluatedSlots.filter((slot) => slot.transportNeed !== "none").length,
    reminderGaps: evaluatedSlots.filter((slot) => slot.reminderGap !== "none").length,
    slots: evaluatedSlots,
    disclaimer: cleanRoomDisclaimer
  };
}

export function evaluateSlot(slot: AppointmentSlot): AppointmentReadiness {
  const openTasks = slot.tasks.filter((task) => task.status !== "done");
  const reminderGap = findReminderGap(slot);
  const transportNeed = slot.transport.status === "confirmed" ? "none" : slot.transport.description;
  const readinessScore = calculateReadinessScore(openTasks, reminderGap, transportNeed);
  const band = readinessBand(readinessScore);

  return {
    slotId: slot.id,
    label: `${slot.window} | ${slot.location} | ${slot.fictionalGuest}`,
    readinessScore,
    band,
    openTasks: sortTasks(openTasks),
    transportNeed,
    reminderGap,
    nextAction: chooseNextAction(openTasks, reminderGap, transportNeed)
  };
}

function calculateReadinessScore(openTasks: ReadinessTask[], reminderGap: string, transportNeed: string): number {
  const taskPenalty = openTasks.reduce((sum, task) => sum + (task.priority === "high" ? 18 : task.priority === "medium" ? 10 : 5), 0);
  const reminderPenalty = reminderGap === "none" ? 0 : 16;
  const transportPenalty = transportNeed === "none" ? 0 : 14;

  return Math.max(0, 100 - taskPenalty - reminderPenalty - transportPenalty);
}

function readinessBand(score: number): ReadinessBand {
  if (score >= 82) {
    return "ready";
  }

  if (score >= 60) {
    return "watch";
  }

  return "action";
}

function findReminderGap(slot: AppointmentSlot): string {
  if (slot.reminders.finalReminder === "sent") {
    return "none";
  }

  if (slot.reminders.finalReminder === "queued") {
    return "final reminder queued but not sent";
  }

  return "final reminder missing";
}

function chooseNextAction(openTasks: ReadinessTask[], reminderGap: string, transportNeed: string): string {
  const highPriorityTask = sortTasks(openTasks).find((task) => task.priority === "high");

  if (highPriorityTask) {
    return highPriorityTask.title;
  }

  if (transportNeed !== "none") {
    return `Resolve transport note: ${transportNeed}`;
  }

  if (reminderGap !== "none") {
    return `Close reminder gap: ${reminderGap}`;
  }

  return "No readiness task required";
}

function sortTasks(tasks: ReadinessTask[]): ReadinessTask[] {
  const priorityOrder: Record<ReadinessTask["priority"], number> = { high: 0, medium: 1, low: 2 };

  return [...tasks].sort((left, right) => priorityOrder[left.priority] - priorityOrder[right.priority] || left.title.localeCompare(right.title));
}
