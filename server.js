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

// Root Route
app.get("/", (req, res) => {
  res.send("Code is running on port 9000");
});

// API Endpoint: Add Data to Google Sheet
app.post("/add-data", async (req, res) => {
  try {
    const sheets = await getSheetsClient();
    const { values } = req.body; // Expecting JSON format { "values": [["Name", "Email", "Phone", "City"]] }

    if (!values || !Array.isArray(values)) {
      return res.status(400).json({ error: "Invalid request body. Expected an array of values." });
    }

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Sheet2",
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });

    res.json({ success: true, message: "Data added successfully", data: response.data });
  } catch (error) {
    console.error("Error adding data:", error);
    res.status(500).json({ error: error.message });
  }
});

// API Endpoint: Scrape LinkedIn Data
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

    // console.log('response skill[]===============================>',data.data[0].data.skills);
    // console.log('response skill===============================>',data.data[0].data.skills[0]);
    // console.log('response skill===============================>',data.data[0].data.skills[0].title);

  const allSkills = data?.data[0]?.data?.skills?.map(skill => skill.title) || [];
  console.log("All Skills Titles:", allSkills);



    res.json({ success: true, data });
  } catch (error) {
    console.error("Error scraping LinkedIn data:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
