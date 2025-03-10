import currentModulePaths from 'current-module-paths'
import express from "express";
import config from "config";
import {promises as fs} from "fs";
import puppeteer from "puppeteer";
import path from "path";
import { COUNTRY, NAME, TOWN } from "translation";

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
    const template = await fs.readFile(filePath, "utf-8");

    // Replace placeholders with actual values
    const processedHtml = template
      .replace(/\[name\]/g, params.name || "(onbekend)")
      .replace(/\[city\]/g, params.city || "(onbekend)")
      .replace(/\[country\]/g, params.country || "(onbekend)")
      .translate(/\[t_name]/g, params.lan, NAME)
      .translate(/\[t_town]/g, params.lan, TOWN)
      .translate(/\[t_country]/g, params.lan, COUNTRY);

    return processedHtml;
  }
  catch (error) {
    throw new Error(`Failed to process HTML template: ${error.message}`);
  }
};

// HTTP GET route to handle image creation requests
app.get("/generate-image", async (req, res) => {
  const { state, name, city, country } = req.query;

  if (!state || !["create", "delete"].includes(state)) 
    return res.status(400).send("Invalid 'state' parameter. Must be 'create' or 'delete'.");
  

  try {
    // Generate HTML from the template
    const htmlContent = await getProcessedHtml(state, { name, city, country });

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
