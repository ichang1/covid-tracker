import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import mapPlaceInfoRoutes from "./routes/mapPlaceInfo.js";

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use("/", mapPlaceInfoRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
