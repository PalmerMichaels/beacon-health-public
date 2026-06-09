import type { TeamCheckIn } from "./seed.js";

export type BeaconSummary = {
  totalTeams: number;
  averageMoodScore: number;
  averageCoveragePercent: number;
  totalOpenFollowUps: number;
  attentionTeams: string[];
  disclaimer: string;
};

export const cleanRoomDisclaimer =
  "Clean-room public demo only: synthetic, non-clinical wellness operations data; not medical advice and not patient records.";

export function summarizeCheckIns(checkIns: TeamCheckIn[]): BeaconSummary {
  if (checkIns.length === 0) {
    return {
      totalTeams: 0,
      averageMoodScore: 0,
      averageCoveragePercent: 0,
      totalOpenFollowUps: 0,
      attentionTeams: [],
      disclaimer: cleanRoomDisclaimer
    };
  }

  const totals = checkIns.reduce(
    (acc, item) => ({
      moodScore: acc.moodScore + item.moodScore,
      coveragePercent: acc.coveragePercent + item.coveragePercent,
      openFollowUps: acc.openFollowUps + item.openFollowUps
    }),
    { moodScore: 0, coveragePercent: 0, openFollowUps: 0 }
  );

  return {
    totalTeams: checkIns.length,
    averageMoodScore: roundOne(totals.moodScore / checkIns.length),
    averageCoveragePercent: roundOne(totals.coveragePercent / checkIns.length),
    totalOpenFollowUps: totals.openFollowUps,
    attentionTeams: checkIns
      .filter((item) => item.moodScore < 72 || item.coveragePercent < 90 || item.openFollowUps >= 3)
      .map((item) => item.team),
    disclaimer: cleanRoomDisclaimer
  };
}

function roundOne(value: number): number {
  return Math.round(value * 10) / 10;
}
