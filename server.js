const express = require("express");
const axios = require("axios");
const pool = require("./db");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

async function fetchData() {
  try {
    const response = await axios.get("https://api.wazirx.com/api/v2/tickers");
    const tickers = Object.values(response.data).slice(0, 10); // Get top 100 tickers

    // Clear existing data
    await pool.query("DELETE FROM tickers");

    for (const ticker of tickers) {
      await pool.query(
        "INSERT INTO tickers (name, last, buy, sell, volume, base_unit, quote_unit, low, high, type, open, at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)",
        [
          ticker.name,
          ticker.last,
          ticker.buy,
          ticker.sell,
          ticker.volume,
          ticker.base_unit,
          ticker.quote_unit,
          ticker.low,
          ticker.high,
          ticker.type,
          ticker.open,
          ticker.at,
        ]
      );
    }
    console.log("Data fetched and stored in the database");
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

setInterval(fetchData, 3600000);

fetchData();

app.get("/api/tickers", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tickers");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving data from database" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
