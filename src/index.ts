import { summarizeCheckIns } from "./core.js";
import { syntheticCheckIns } from "./seed.js";

const summary = summarizeCheckIns(syntheticCheckIns);

console.log("Beacon Health Demo Operations Summary");
console.log("=====================================");
console.log(`Teams reviewed: ${summary.totalTeams}`);
console.log(`Average mood score: ${summary.averageMoodScore}`);
console.log(`Average coverage: ${summary.averageCoveragePercent}%`);
console.log(`Open follow-ups: ${summary.totalOpenFollowUps}`);
console.log(
  `Attention queue: ${summary.attentionTeams.length > 0 ? summary.attentionTeams.join(", ") : "none"}`
);
console.log("");
console.log(summary.disclaimer);
