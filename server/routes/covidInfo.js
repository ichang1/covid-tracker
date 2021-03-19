import express from "express";
import { getSpecificInfo } from "../controllers/specificCovidInfo.js";

const router = express.Router();

router.get("/:place", getSpecificInfo);

export default router;
