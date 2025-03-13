import currentModulePaths from "current-module-paths"
import express from "express";
import handlebars from "handlebars";
import config from "config";
import {promises as fs} from "fs";
import puppeteer from "puppeteer";
import path from "path";
import { COUNTRY, NAME, TOWN, UNKNOWN, A_NEW_ONE, AND_GONE, t } from "translation";

const app = express();
const PORT = config.get("port");

const { __dirname } = currentModulePaths(import.meta.url)

// Serve static files from the "templates" directory
app.use("/templates", express.static(path.join(__dirname, "../templates")));

// Utility function to read and process HTML template
const getProcessedHtml = async (state, params) => {
  try {
    // Determine the HTML template file based on the state
    const fileName = state === "create" ? "create-template.html" : "delete-template.html";
    const filePath = path.join(__dirname, "../templates", fileName);

    // Read the template file
    const template = handlebars.compile(await fs.readFile(filePath, "utf-8"));

    const data = {
      name: params.name || `(${t(params.lan, UNKNOWN)})`,
      city: params.city || `(${t(params.lan, UNKNOWN)})`,
      country: params.country || `(${t(params.lan, UNKNOWN)})`,
      t_name: t(params.lan, NAME),
      t_town: t(params.lan, TOWN),
      t_country: t(params.lan, COUNTRY),
      t_new: t(params.lan, A_NEW_ONE),
      t_gone: t(params.lan, AND_GONE)
    }

    // Replace placeholders with actual values
    return template(data);
  }
  catch (error) {
    throw new Error(`Failed to process HTML template: ${error.message}`);
  }
};

// HTTP GET route to handle image creation requests
app.get("/generate-image", async (req, res) => {
  const { state, name, city, country, lan } = req.query;

  if (!state || !["create", "delete"].includes(state)) 
    return res.status(400).send("Invalid 'state' parameter. Must be 'create' or 'delete'.");
  

  try {
    // Generate HTML from the template
    const htmlContent = await getProcessedHtml(state, { name, city, country, lan });

    // Launch Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const expectedLocation = `http://localhost:${PORT}/templates/blank.html`;
    await page.goto(expectedLocation);

    // Set content and base URL for loading assets
    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
    });

    // Set viewport for consistent image output
    await page.setViewport({ width: config.get("viewport-width"), height: config.get("viewport-height") });

    // Take a screenshot as JPG
    const screenshot = await page.screenshot({ type: config.get("screenshot-type") });

    // Close the browser
    await browser.close();

    // Send the JPG image as the response
    res.setHeader("Content-Type", config.get("content-type"));
    res.end(screenshot, "binary"); // Explicitly send the buffer as binary
  }
  catch (error) {
    console.error(error);
    res.status(500).send("Failed to generate image.");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
