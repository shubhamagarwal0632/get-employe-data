const express = require("express");
const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");
const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = require('node-fetch'); // Make sure to install: npm install node-fetch@2
require("dotenv").config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 9000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Google Sheets Config
const sheetId = "1OZXopBefudwPE9pgzMnwbx4RogGbr4gTQ6uPQAtBiBo"; // Your Sheet ID

// Function to authenticate with Google Sheets API using BASE64 environment variable
async function getSheetsClient() {
    const base64Key = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;

    if (!base64Key) {
        throw new Error("GOOGLE_SERVICE_ACCOUNT_BASE64 environment variable is missing.");
    }

    // Decode the Base64 string into a JSON object
    const credentials = JSON.parse(Buffer.from(base64Key, "base64").toString("utf8"));

    const auth = new GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    return google.sheets({ version: "v4", auth });
}

// Root Route
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

      const sheets = await getSheetsClient();

      const values = [];

      const timestamp = new Date().toISOString();

      // Loop through each profile (in case of multiple links)
      data.data.forEach(profile => {
          const profileUrl = profile.data?.link;
          const fullName = profile.data?.fullName || 'N/A';
          const headline = profile.data?.headline || 'N/A';
          const location = profile.data?.location || 'N/A';
          const skills = profile.data?.skills?.map(skill => skill.title).join(', ') || 'N/A';

          // Add row to values array
          values.push([timestamp, profileUrl, fullName, headline, location, skills]);
      });

      // Append data into Google Sheets
      if (values.length > 0) {
          const sheetResponse = await sheets.spreadsheets.values.append({
              spreadsheetId: sheetId,
              range: "Sheet2",
              valueInputOption: "USER_ENTERED",
              requestBody: { values },
          });

          console.log("Sheet Response:", sheetResponse.data);
      } else {
          console.log("No profiles found to add to Google Sheets.");
      }

      res.json({
          success: true,
          message: "LinkedIn data stored in Google Sheets",
      });

  } catch (error) {
      console.error("Error scraping LinkedIn data and storing:", error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});


// Function to fetch URLs from Google Sheets and send to /scrape-linkedin with 1-minute delay
async function fetchAndSendLinks() {
  try {
      const sheets = await getSheetsClient();
      const response = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: 'Sheet2'
      });

      const rows = response.data.values || [];
      const urls = rows.map(row => row[0]).filter(Boolean); // Extract only the first column (URLs)

      console.log(`Fetched ${urls.length} URLs from Google Sheets`);

      let index = 0;

      async function processNextBatch() {
          if (index >= urls.length) {
              console.log("All URLs have been processed.");
              return;
          }

          const batch = urls.slice(index, index + 2); // Get 2 URLs at a time
          console.log(`Sending URLs ${index + 1}-${index + batch.length}/${urls.length}:`, batch);

          try {
              const scrapeResponse = await fetch('http://localhost:9000/scrape-linkedin', { // Call your own endpoint
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ links: batch })
              });

              const result = await scrapeResponse.json();
              console.log(`Result for batch ${index + 1}-${index + batch.length}:`, result);
          } catch (err) {
              console.error(`Error scraping batch:`, batch, err);
          }

          index += 2;
          setTimeout(processNextBatch, 5000); // 1-minute delay between batches
      }

      if (urls.length > 0) {
          processNextBatch();
      } else {
          console.log("No URLs found in Google Sheets.");
      }
  } catch (error) {
      console.error("Error fetching URLs from Google Sheets:", error);
  }
}


// Start Server and Schedule the Fetching Process
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    fetchAndSendLinks(); // Run immediately when the server starts
});
