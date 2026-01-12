/**
 * db.js
 * -------------------------------
 * Centralized SQLite database setup.
 *
 * - Ensures the database directory exists
 * - Creates or connects to the SQLite database file
 * - Exports a single shared database instance
 *
 * This approach is deployment-safe (including free-tier hosting).
 */

const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

/**
 * Resolve database directory and file path
 */
const DATABASE_DIR = path.join(__dirname, "..", "data");
const DATABASE_FILE = path.join(DATABASE_DIR, "database.sqlite");

/**
 * Ensure the database directory exists
 * (Required for first-time setup and cloud deployments)
 */
if (!fs.existsSync(DATABASE_DIR)) {
  fs.mkdirSync(DATABASE_DIR, { recursive: true });
}

/**
 * Initialize SQLite database connection
 */
const db = new sqlite3.Database(DATABASE_FILE, (error) => {
  if (error) {
    console.error("❌ SQLite connection failed:", error.message);
    return;
  }

  console.log("✅ SQLite database connected successfully");
});

module.exports = db;
