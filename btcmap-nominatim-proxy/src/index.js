import express from "express";
import config from "config";
import { getGeo } from "./nominatim.js";
import { logger } from "btcmap-common";
import { NominatimError } from "./error-dispatcher.js";

const wsConfig = config.get("webserver");

const app = express();

// Parse JSON request bodies (optional)
app.use(express.json());

// GET /geo?lat=...&lon=...
app.get("/geo", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    logger.info(`/geo lat: ${lat}, lon: ${lon}`);

    if (!lat || !lon)
      return res.status(400).json({ message: "Missing lat or lon parameter" });

    const result = await getGeo(lat, lon);
    res.json(result);
  }
  catch (err) {
    logger.error(err);

    // catch upstream errors
    if (err instanceof NominatimError) {
      res.status(502).json(err);
      return;
    }

    // catch unexpected errors
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const port = wsConfig.port;
app.listen(port, () => {
  logger.info(`btcmap-nominatim-proxy is running on port ${port}`);
});
