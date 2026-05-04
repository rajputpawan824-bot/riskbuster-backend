import { Category } from "../models/Category.js";

const CATEGORY_SEED = [
  {
    title: "Cyber Security",
    creditTo: "John Doe / Cybersecurity Council",
    description:
      "Risks related to digital infrastructure, data breaches, ransomware, and state-sponsored cyber operations.",
    fileLink: "https://example.com/cyber-security-report.pdf",
  },
  {
    title: "Physical Threats",
    creditTo: "Risk Analysis Unit",
    description:
      "Terrorism, civil unrest, workplace violence, and critical infrastructure physical attacks.",
    fileLink: "",
  },
  {
    title: "Geopolitical Risks",
    creditTo: "Global Affairs Desk",
    description: "Sanctions, border disputes, and diplomatic tensions affecting business continuity.",
    fileLink: "",
  },
  {
    title: "Financial Risks",
    creditTo: "Treasury & Compliance",
    description: "Market volatility, fraud, AML, and credit exposure in conflict-affected regions.",
    fileLink: "",
  },
  {
    title: "Environmental Risks",
    creditTo: "ESG Program",
    description:
      "Natural disasters, resource scarcity, and environmental regulation under stress conditions.",
    fileLink: "",
  },
];

export async function seedCategoriesIfEmpty() {
  const n = await Category.countDocuments();
  if (n > 0) return;
  await Category.insertMany(CATEGORY_SEED.map((c) => ({ ...c, parent: null })));
  console.log("Seeded default categories (MongoDB).");
}

