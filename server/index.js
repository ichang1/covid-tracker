import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import covidInfoRoutes from "./routes/covidInfo.js";

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use("/", "client/src/index.js");
app.use("/", covidInfoRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
