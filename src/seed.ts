export type ReadinessTask = {
  title: string;
  category: "outreach" | "transport" | "reminder" | "paperwork";
  priority: "high" | "medium" | "low";
  status: "open" | "queued" | "done";
};

export type AppointmentSlot = {
  id: string;
  window: string;
  location: string;
  fictionalGuest: string;
  reminders: {
    initialNotice: "sent" | "queued";
    finalReminder: "sent" | "queued" | "missing";
  };
  transport: {
    status: "confirmed" | "needs-review" | "not-needed";
    description: string;
  };
  tasks: ReadinessTask[];
};

export const syntheticAppointmentSlots: AppointmentSlot[] = [
  {
    id: "apt-1001",
    window: "Tue 09:00",
    location: "North Loop Demo Room",
    fictionalGuest: "Guest Cedar",
    reminders: {
      initialNotice: "sent",
      finalReminder: "sent"
    },
    transport: {
      status: "confirmed",
      description: "none"
    },
    tasks: [
      {
        title: "Confirm lobby wayfinding card is attached",
        category: "paperwork",
        priority: "low",
        status: "done"
      }
    ]
  },
  {
    id: "apt-1002",
    window: "Tue 10:30",
    location: "Riverfront Demo Suite",
    fictionalGuest: "Guest Juniper",
    reminders: {
      initialNotice: "sent",
      finalReminder: "queued"
    },
    transport: {
      status: "needs-review",
      description: "rideshare pickup window not confirmed"
    },
    tasks: [
      {
        title: "Call fictional contact to confirm arrival preference",
        category: "outreach",
        priority: "high",
        status: "open"
      },
      {
        title: "Send parking map reminder",
        category: "reminder",
        priority: "medium",
        status: "queued"
      }
    ]
  },
  {
    id: "apt-1003",
    window: "Tue 13:15",
    location: "Harbor Mock Clinic",
    fictionalGuest: "Guest Laurel",
    reminders: {
      initialNotice: "queued",
      finalReminder: "missing"
    },
    transport: {
      status: "not-needed",
      description: "none"
    },
    tasks: [
      {
        title: "Queue synthetic reminder script",
        category: "reminder",
        priority: "medium",
        status: "open"
      }
    ]
  },
  {
    id: "apt-1004",
    window: "Tue 15:45",
    location: "Maple Training Center",
    fictionalGuest: "Guest Rowan",
    reminders: {
      initialNotice: "sent",
      finalReminder: "sent"
    },
    transport: {
      status: "needs-review",
      description: "shuttle seat count pending"
    },
    tasks: [
      {
        title: "Verify shuttle note with front desk simulation",
        category: "transport",
        priority: "medium",
        status: "open"
      },
      {
        title: "Archive duplicate demo outreach task",
        category: "outreach",
        priority: "low",
        status: "done"
      }
    ]
  }
];
