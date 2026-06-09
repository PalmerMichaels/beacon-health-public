import { buildReadinessReport, cleanRoomDisclaimer } from "./readiness.js";
import { syntheticAppointmentSlots } from "./seed.js";

const report = buildReadinessReport(syntheticAppointmentSlots, "Synthetic Tuesday Schedule");

console.log("Beacon Health Appointment Readiness Beacon");
console.log("==========================================");
console.log(cleanRoomDisclaimer);
console.log("");
console.log(`Schedule: ${report.generatedFor}`);
console.log(`Appointments reviewed: ${report.totalSlots}`);
console.log(`Ready: ${report.readyCount} | Watch: ${report.watchCount} | Action: ${report.actionCount}`);
console.log(`Open fictional tasks: ${report.totalOpenTasks}`);
console.log(`Transport needs: ${report.transportNeeds}`);
console.log(`Reminder gaps: ${report.reminderGaps}`);
console.log("");

for (const slot of report.slots) {
  console.log(`${slot.slotId} [${slot.band.toUpperCase()} ${slot.readinessScore}] ${slot.label}`);
  console.log(`  Next action: ${slot.nextAction}`);
  console.log(`  Transport: ${slot.transportNeed}`);
  console.log(`  Reminder: ${slot.reminderGap}`);
  console.log(`  Open tasks: ${slot.openTasks.length === 0 ? "none" : slot.openTasks.map((task) => `${task.priority}:${task.title}`).join("; ")}`);
}
