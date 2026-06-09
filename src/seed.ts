export type TeamCheckIn = {
  team: string;
  shift: "morning" | "midday" | "evening";
  moodScore: number;
  coveragePercent: number;
  openFollowUps: number;
  note: string;
};

export const syntheticCheckIns: TeamCheckIn[] = [
  {
    team: "North Studio",
    shift: "morning",
    moodScore: 82,
    coveragePercent: 96,
    openFollowUps: 1,
    note: "Demo team reports steady workload and one onboarding reminder."
  },
  {
    team: "River Desk",
    shift: "midday",
    moodScore: 68,
    coveragePercent: 88,
    openFollowUps: 3,
    note: "Fictional scheduling gap needs a coordinator check-in."
  },
  {
    team: "Harbor Pod",
    shift: "evening",
    moodScore: 74,
    coveragePercent: 91,
    openFollowUps: 2,
    note: "Synthetic handoff list is ready for tomorrow's planning huddle."
  }
];
