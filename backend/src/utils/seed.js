/**
 * seed.js
 * ------------------------------------------------
 * Database initialization & seeding script.
 *
 * Responsibilities:
 * - Create required tables if they do not exist
 * - Safely ensure reset-password columns exist
 * - Seed a default admin account (runs once)
 */

const db = require("../config/db");
const bcrypt = require("bcrypt");

/* ======================================================
   CREATE DATABASE TABLES
====================================================== */
const createTables = () => {
  db.serialize(() => {
    /* -------------------- USERS TABLE -------------------- */
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

    /**
     * SQLite does not support IF NOT EXISTS for ALTER TABLE.
     * These statements are intentionally silent if columns already exist.
     */
    db.run(`ALTER TABLE users ADD COLUMN reset_token TEXT`, () => {});
    db.run(`ALTER TABLE users ADD COLUMN reset_token_expiry INTEGER`, () => {});

    /* -------------------- STORES TABLE -------------------- */
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

    /* -------------------- RATINGS TABLE -------------------- */
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

    console.log("✅ Database tables created or already exist");
  });
};

/* ======================================================
   SEED DEFAULT ADMIN USER
====================================================== */
const seedAdmin = async () => {
  const ADMIN_EMAIL = "admin@store.com";
  const ADMIN_PASSWORD = "Admin@123";

  db.get(
    `SELECT id FROM users WHERE email = ?`,
    [ADMIN_EMAIL],
    async (err, admin) => {
      if (err) {
        console.error("❌ Failed to check admin user:", err.message);
        return;
      }

      // Create admin only if it does not exist
      if (!admin) {
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

        db.run(
          `
          INSERT INTO users (name, email, password, role)
          VALUES (?, ?, ?, ?)
          `,
          ["System Admin", ADMIN_EMAIL, hashedPassword, "admin"]
        );

        console.log("✅ Default admin account created");
      }
    }
  );
};

/* ======================================================
   DATABASE INITIALIZATION
====================================================== */
const seedDatabase = async () => {
  createTables();
  await seedAdmin();
};

module.exports = seedDatabase;
