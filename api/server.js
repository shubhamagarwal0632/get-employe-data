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
