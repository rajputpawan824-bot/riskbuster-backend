import { Router } from "express";
import {
  createCountry,
  deleteCountry,
  listCountries,
  updateCountry,
} from "../controllers/countriesController.js";
import { authRequired } from "../middleware/authRequired.js";

export const countriesRouter = Router();

countriesRouter.get("/", listCountries);
countriesRouter.post("/", authRequired, createCountry);
countriesRouter.put("/:id", authRequired, updateCountry);
countriesRouter.delete("/:id", authRequired, deleteCountry);
