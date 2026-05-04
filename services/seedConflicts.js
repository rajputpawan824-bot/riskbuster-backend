import { Conflict } from "../models/Conflict.js";

const CONFLICTS_SEED = [
  {
    title: "Russia-Ukraine War",
    description:
      "Ongoing large-scale military conflict in Eastern Europe with regional and global security implications.",
    country: "Ukraine",
    status: "Active",
    conflictType: "critical",
    date: "2024-05-20",
  },
  {
    title: "Israel-Hamas Conflict",
    description: "Escalation of hostilities in Gaza and surrounding areas with high humanitarian impact.",
    country: "Israel / Palestine",
    status: "Active",
    conflictType: "critical",
    date: "2024-04-12",
  },
  {
    title: "Yemen Civil War",
    description:
      "Protracted internal conflict with regional power involvement; fragile ceasefire periods.",
    country: "Yemen",
    status: "Outdated",
    conflictType: "high",
    date: "2023-11-02",
  },
  {
    title: "Syria Internal Conflict",
    description: "Divided control, displacement, and occasional flare-ups in multiple regions.",
    country: "Syria",
    status: "Active",
    conflictType: "high",
    date: "2024-02-14",
  },
  {
    title: "Sudan Civil War",
    description: "Fighting and humanitarian emergency affecting population movement and aid access.",
    country: "Sudan",
    status: "Active",
    conflictType: "critical",
    date: "2024-01-20",
  },
  {
    title: "Myanmar Civil Conflict",
    description: "Armed resistance and internal instability in several states and border areas.",
    country: "Myanmar",
    status: "Outdated",
    conflictType: "medium",
    date: "2023-08-10",
  },
  {
    title: "Eastern DR Congo",
    description:
      "Militia activity, displacement, and regional security concerns in the east of the country.",
    country: "DR Congo",
    status: "Active",
    conflictType: "high",
    date: "2024-03-05",
  },
  {
    title: "Tigray Aftermath (Ethiopia)",
    description: "Ongoing political and security legacies following a major internal conflict period.",
    country: "Ethiopia",
    status: "Outdated",
    conflictType: "medium",
    date: "2023-05-18",
  },
  {
    title: "Al-Shabaab Insurgency",
    description:
      "Terror and insurgent activity impacting governance and development in the Horn of Africa.",
    country: "Somalia",
    status: "Active",
    conflictType: "high",
    date: "2024-04-30",
  },
  {
    title: "Sahel & Border Instability (Sudan)",
    description:
      "Cross-border spillover risks; regional coordination to manage security and trade routes.",
    country: "Sudan",
    status: "Outdated",
    conflictType: "low",
    date: "2022-12-01",
  },
];

export async function seedConflictsIfEmpty() {
  const n = await Conflict.countDocuments();
  if (n > 0) return;
  await Conflict.insertMany(CONFLICTS_SEED);
  console.log("Seeded default conflicts (MongoDB).");
}

