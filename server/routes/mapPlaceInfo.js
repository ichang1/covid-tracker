import express from "express";
import { getMapPlaceInfo } from "../controllers/mapPlaceInfo.js";

const router = express.Router();

router.get("/:place", getMapPlaceInfo);

export default router;
