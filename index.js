import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { MONGODB_URI, PORT } from "./config/env.js";
import { authRouter } from "./routes/authRoutes.js";
import { categoriesRouter } from "./routes/categoriesRoutes.js";
import { conflictsRouter } from "./routes/conflictsRoutes.js";
import { countriesRouter } from "./routes/countriesRoutes.js";
import { healthRouter } from "./routes/healthRoutes.js";
import { knowledgeArticlesRouter } from "./routes/knowledgeArticlesRoutes.js";
import { templatesRouter } from "./routes/templatesRoutes.js";
import { seedCategoriesIfEmpty } from "./services/seedCategories.js";

import { backfillCountryRegions, seedCountriesIfEmpty } from "./services/seedCountries.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders(res, filePath) {
      const filename = path.basename(filePath);
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    },
  })
);

app.use("/api/auth", authRouter);
app.use("/api/conflicts", conflictsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/countries", countriesRouter);
app.use("/api/knowledge-articles", knowledgeArticlesRouter);
app.use("/api/templates", templatesRouter);
app.use("/api/health", healthRouter);

async function start() {
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI in environment. Set it in server/.env");
    process.exit(1);
  }
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");
  await seedCategoriesIfEmpty();

  await seedCountriesIfEmpty();
  await backfillCountryRegions();
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
