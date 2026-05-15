import { Country } from "../models/Country.js";

/** Default seed countries with the region values shown in the UI dropdown. */
const COUNTRIES_SEED = [
  { label: "Ukraine", flag: "🇺🇦", region: "Eastern Europe" },
  { label: "Israel", flag: "🇮🇱", region: "Western Asia" },
  { label: "Palestine", flag: "🇵🇸", region: "Western Asia" },  
  { label: "Syria", flag: "🇸🇾", region: "Western Asia" },
  { label: "Yemen", flag: "🇾🇪", region: "Western Asia" },
  { label: "Sudan", flag: "🇸🇩", region: "Northern Africa" },
  { label: "Myanmar", flag: "🇲🇲", region: "South-Eastern Asia" },
  { label: "DR Congo", flag: "🇨🇩", region: "Middle Africa" },
  { label: "Ethiopia", flag: "🇪🇹", region: "Eastern Africa" },
  { label: "Somalia", flag: "🇸🇴", region: "Eastern Africa" },
];

const DEFAULT_REGION_BY_LABEL = Object.fromEntries(
  COUNTRIES_SEED.map((c) => [c.label.toLowerCase(), c.region])
);

/**
 * Map of legacy region names → current region dropdown values.
 * Used by the migration to upgrade older installs without manual editing.
 */
const LEGACY_REGION_MAP = {
  Africa: "Africa",
  Asia: "Asia",
  Europe: "Europe",
  "Middle East": "Western Asia",
  Oceania: "Oceania",
  "South America": "South America",
  "Asia-Pacific": "Asia",
  "East Asia and Pacific": "Asia",
  "Europe and Central Asia": "Europe",
  "Latin America and Caribbean": "South America",
  "Middle East and North Africa": "Western Asia",
  "Sub-Saharan Africa": "Africa",
};

const VALID_REGIONS = new Set(Object.values(LEGACY_REGION_MAP).concat([
  "Africa",
  "Northern Africa",
  "Western Africa",
  "Middle Africa",
  "Eastern Africa",
  "Southern Africa",
  "Asia",
  "Central Asia",
  "Eastern Asia",
  "South-Eastern Asia",
  "Southern Asia",
  "Western Asia",
  "Europe",
  "Northern Europe",
  "Western Europe",
  "Eastern Europe",
  "Southern Europe",
  "North America",
  "Northern America",
  "Central America",
  "Caribbean",
  "South America",
  "Andean States",
  "Southern Cone",
  "Brazil Region",
  "Guianas",
  "Oceania",
  "Australia and New Zealand",
  "Melanesia",
  "Micronesia",
  "Polynesia",
  "Antarctica",
]));

export async function seedCountriesIfEmpty() {
  const n = await Country.countDocuments();
  if (n > 0) return;
  await Country.insertMany(COUNTRIES_SEED);
  console.log("Seeded default countries (MongoDB).");
}

/**
 * One-time backfill:
 *   1. For existing countries with no region, fill in a sensible default from
 *      the seed list.
 *   2. For countries whose region uses a legacy name (e.g. "Europe and
 *      Central Asia"), upgrade them to a current dropdown value.
 * Safe to run on every boot.
 */
export async function backfillCountryRegions() {
  const docs = await Country.find({ isDeleted: { $ne: true } }).exec();
  let filled = 0;
  let migrated = 0;
  for (const doc of docs) {
    const current = (doc.region || "").trim();

    if (!current) {
      const guess = DEFAULT_REGION_BY_LABEL[String(doc.label).toLowerCase()];
      if (guess) {
        doc.region = guess;
        await doc.save();
        filled++;
      }
      continue;
    }

    if (LEGACY_REGION_MAP[current]) {
      const seedRegion = DEFAULT_REGION_BY_LABEL[String(doc.label).toLowerCase()];
      doc.region = seedRegion || LEGACY_REGION_MAP[current];
      await doc.save();
      migrated++;
      continue;
    }

    if (!VALID_REGIONS.has(current)) {
      const seedRegion = DEFAULT_REGION_BY_LABEL[String(doc.label).toLowerCase()];
      if (seedRegion) {
        doc.region = seedRegion;
        await doc.save();
        migrated++;
      }
    }
  }
  if (filled > 0) {
    console.log(`Backfilled region on ${filled} countries.`);
  }
  if (migrated > 0) {
    console.log(`Migrated region on ${migrated} countries to current region names.`);
  }
}
