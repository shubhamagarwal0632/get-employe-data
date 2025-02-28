const express = require("express");
const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fetch = require('node-fetch'); // Make sure to install: npm install node-fetch@2
require("dotenv").config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 9000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
// API Endpoint: Scrape LinkedIn Data
// Google Sheets Config
const sheetId = "1OZXopBefudwPE9pgzMnwbx4RogGbr4gTQ6uPQAtBiBo"; // Your Sheet ID
const serviceAccountKeyFile = path.join(__dirname, "serene-athlete-452011-t0-9b8c68977c15.json");

// Function to authenticate with Google Sheets API
async function getSheetsClient() {
  const auth = new GoogleAuth({
    keyFile: serviceAccountKeyFile,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

app.get("/", (req, res) => {
  res.send("Code is running on port 9000");
});
app.post('/scrape-linkedin', async (req, res) => {
  try {
      const { links } = req.body;

      if (!links || !Array.isArray(links)) {
          return res.status(400).json({ error: "Invalid request body. 'links' must be an array." });
      }

      const url = 'https://linkedin-bulk-data-scraper.p.rapidapi.com/profiles';

      const response = await fetch(url, {
          method: 'POST',
          headers: {
              'x-rapidapi-key': 'a2f903b083mshc8b5e3bfb06de66p174179jsne78a3f961d7e',
              'x-rapidapi-host': 'linkedin-bulk-data-scraper.p.rapidapi.com',
              'Content-Type': 'application/json',
              'x-rapidapi-user': 'usama'
          },
          body: JSON.stringify({ links })
      });

      const data = await response.json();

      if (!response.ok) {
          return res.status(response.status).json({ error: "Failed to fetch LinkedIn data", details: data });
      }

      console.log("LinkedIn API Response:", data);

      // Convert response to string to store in a cell
      const jsonString = JSON.stringify(data);

      // Prepare data to be inserted into Google Sheets
      const values = [
          [new Date().toISOString(), jsonString]  // Column A = Timestamp, Column B = Full JSON Response
      ];

      // Save to Google Sheets
      const sheets = await getSheetsClient();
      const sheetResponse = await sheets.spreadsheets.values.append({
          spreadsheetId: sheetId,
          range: "Sheet2",
          valueInputOption: "USER_ENTERED",
          requestBody: { values },
      });

      res.json({
          success: true,
          message: "LinkedIn data stored in Google Sheets",
          sheetResponse: sheetResponse.data
      });

  } catch (error) {
      console.error("Error scraping LinkedIn data and storing:", error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
