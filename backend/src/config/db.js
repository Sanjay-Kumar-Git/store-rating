/**
 * db.js
 * -----
 * SQLite database connection configuration.
 * Ensures database directory exists before connecting.
 */

const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// Database file location
const dbDir = path.join(__dirname, "..", "data");
const dbPath = path.join(dbDir, "database.sqlite");

// Ensure database directory exists (important for deployment)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create / connect database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Failed to connect to SQLite:", err.message);
  } else {
    console.log("✅ Connected to SQLite database");
  }
});

module.exports = db;
