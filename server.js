const express = require("express");
const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");
const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = require('node-fetch'); // Make sure to install: npm install node-fetch@2
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 9000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Google Sheets Config
const sheetId = "1OZXopBefudwPE9pgzMnwbx4RogGbr4gTQ6uPQAtBiBo"; // Your Sheet ID

// Service account JSON data directly in code (replace with your actual credentials)
const serviceAccountCredentials = {
    "type": "service_account",
    "project_id": "serene-athlete-452011-t0",
    "private_key_id": "9b8c68977c15cd7bc8595805b2e8ba0a605451f2",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDLdcEdRiq3o42W\nIw69weyjFy6bZ8lDN7EBt1ilLcqblw+czfDGD2wD07aRa0AL16c4ydWtkhjNSwUy\neG8MEF0I6UrjO+k6JmfsJdPs7W3ccs1bkECec3J9YIZ/dOD8K461XBwNeOL+ws+a\nungdamF1q4yC0L8ng8HctDs3l5zkKij4rQ2md3laX1S7xzNz+0HhV9n2AGfHEjcI\n/FlIvGqKAlEiy4ox8N2QHOiq6WmSO0vesngn2nHcCnDv5ojrVPKMBleVbrs4bqDU\nUzvkgsxN1Rd4+VA9uKtuI0Z+mr6BxaDl7k3GkWh8hKWgt3flg9hsykCrNG2fuB3I\nfR+O6kt/AgMBAAECggEACxwyBP1bLvKKayzTw6yjHq5+rJzviUyMzXXnLEzHHtVb\nVHex4E7gtYelp4k1UtTMAP+38qW+aB0r6DIQ0brTl3RErngwVXYjJKGfCNEzbnGU\ns8ICp5s+joi0ZliA1KRYQ1dQuEVTyjQs1227k2VZTxLtyFLurUgkK8hqBR4fnh1O\nzfF2CgTUTgAs9s21NfdxFjeYyV7CnrwFZ4MKv63s6o8iBS82Nj+iFF2ZYpohenVM\n/QYECTJV+gNfnHSDEWTgLuku/IGn70I9LzqXNd++hA+g0hEhuJaXyNqAFC8s1eGX\n7W0bMXkD60tj5ABHLtmqjiFa+IYgj30YT5sSom1KSQKBgQD5U0KDm9tEd3BajnYk\nFTQcJufZLTnPOWxviusEMwGzafZLBBPV1aQ7HRpCHI/NSonZpiekic5JriIH6DNR\nLNymsXr+H5pRU1MJkLA+nXTKwQaQz7hXE+Yql92mq1H0TyfgT6o78F/UqvK3+/hB\nPNkkzaJ8BksujKvPHXy50YahowKBgQDQ6CitlHnY2s46NjM6s8kGHTpvGjbFsmFk\nmr3K5qcP6leAgzTUhJgmrMq/zawAcmovzchSPOiFRXK7oi81zyGTfrgtkhx9CqFb\nyTJXxpprhCFuqGDcrAXBnWxB7xKOLTXTtKKC+4zY6JoxTAhZWppvNXRvajSONVZp\nFeBsyTKkdQKBgDM2zRTnsPSxbBzN4qqqyFd4DmvoBFXyv7lx2bC1IYZPH85s+f4U\nsnWKFti5sThENWjF3qLHw94SrN7e7ZuhEXoUPuVwbGyEJyxx0iIqidEUMVsRsBYC\n+maJZ3hS/LSohdJnytohGC5BJzZvxaDw9NHAg73iNRNMxgX3UqWAypztAoGAHByR\nlMIdH2xaQgUXIbgdvf/i5B5/7lyRtIsKLSqaoo6jVbzSOCLboqCv692OXsUGuwYT\nBdYCaCSvSsaJWdFUsFdmC2PVB5KNoh9R8fPcxckTAqQP3MIdSC+Z6Ml2EsHMs39k\nOwIEsw+h6C5WFUgW7g4ga/m7tsNArIVwHNN6SB0CgYA2BZiPs9UaB1YHAnsBMfIt\niRIf0n5j49i/R8hU1IN+iHILca2zGm8Pcw+07ectRMzAJbWhEvyQcLEA1dGbRQzX\nmSb6VkQCHqtPQ4s16/Oh3c92OfDKaFNTXy68YKl2T6eKy2F93y012WAvIwHHr5os\no5EUAjC65KM5VhFqWDW9kA==\n-----END PRIVATE KEY-----\n",
    "client_email": "shubham-agagrwal@serene-athlete-452011-t0.iam.gserviceaccount.com",
    "client_id": "115043761110569051912",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/shubham-agagrwal%40serene-athlete-452011-t0.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
};

// Function to authenticate with Google Sheets API
async function getSheetsClient() {
    const auth = new GoogleAuth({
        credentials: serviceAccountCredentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    return google.sheets({ version: "v4", auth });
}

// Rest of your code (routes and server start) remain the same
app.get("/", (req, res) => res.send("Code is running on port 9000"));
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

      console.log("sheetResponse============================",sheetResponse)

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
