/**
 * seed.js
 * -------
 * Handles database schema creation and initial seed data.
 * - Creates required tables if they do not exist
 * - Ensures reset-password columns exist (SQLite-safe)
 * - Seeds a default admin user
 */

const db = require("../config/db");
const bcrypt = require("bcrypt");

/**
 * Create database tables
 */
const createTables = () => {
  db.serialize(() => {
    // -------------------- USERS TABLE --------------------
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        address TEXT,
        role TEXT NOT NULL,
        reset_token TEXT,
        reset_token_expiry INTEGER
      )
    `);

    // Ensure reset-password columns exist (SQLite-safe)
    db.run(`ALTER TABLE users ADD COLUMN reset_token TEXT`, () => {});
    db.run(`ALTER TABLE users ADD COLUMN reset_token_expiry INTEGER`, () => {});

    // -------------------- STORES TABLE --------------------
    db.run(`
      CREATE TABLE IF NOT EXISTS stores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        address TEXT,
        owner_id INTEGER,
        FOREIGN KEY (owner_id) REFERENCES users(id)
      )
    `);

    // -------------------- RATINGS TABLE --------------------
    db.run(`
      CREATE TABLE IF NOT EXISTS ratings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        store_id INTEGER NOT NULL,
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, store_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (store_id) REFERENCES stores(id)
      )
    `);

    console.log("✅ Tables created or already exist");
  });
};

/**
 * Seed default admin account (runs only once)
 */
const seedAdmin = async () => {
  const adminEmail = "admin@store.com";

  db.get(
    "SELECT id FROM users WHERE email = ?",
    [adminEmail],
    async (err, row) => {
      if (err) {
        console.error("❌ Error checking admin:", err.message);
        return;
      }

      if (!row) {
        const hashedPassword = await bcrypt.hash("Admin@123", 10);

        db.run(
          `
          INSERT INTO users (name, email, password, role)
          VALUES (?, ?, ?, ?)
          `,
          ["System Admin", adminEmail, hashedPassword, "admin"]
        );

        console.log("✅ Default admin created");
      }
    }
  );
};

/**
 * Initialize database
 */
const seedDatabase = async () => {
  createTables();
  await seedAdmin();
};

module.exports = seedDatabase;
