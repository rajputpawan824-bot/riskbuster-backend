import { Router } from "express";
import {
  createCountry,
  deleteCountry,
  listCountries,
  updateCountry,
} from "../controllers/countriesController.js";
import { authRequired, adminRequired } from "../middleware/authRequired.js";

export const countriesRouter = Router();

countriesRouter.get("/", listCountries);
countriesRouter.post("/", authRequired, adminRequired, createCountry);
countriesRouter.put("/:id", authRequired, adminRequired, updateCountry);
countriesRouter.delete("/:id", authRequired, adminRequired, deleteCountry);

