/**
 * app.js
 * ------------------------------------------------
 * Core Express application setup.
 *
 * Responsibilities:
 * - Initialize database and seed data
 * - Configure global middleware
 * - Register API routes
 * - Provide health check endpoint
 */

const express = require("express");
const cors = require("cors");

// Import route handlers
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const ownerRoutes = require("./routes/ownerRoutes");

// Initialize database & seed data
require("./config/db");
const seedDatabase = require("./utils/seed");

const app = express();

/* ======================================================
   DATABASE INITIALIZATION
====================================================== */

// Create tables and seed default admin (runs once)
seedDatabase();

/* ======================================================
   GLOBAL MIDDLEWARE
====================================================== */

// Enable CORS for frontend-backend communication
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

/* ======================================================
   API ROUTES
====================================================== */

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/owner", ownerRoutes);

/* ======================================================
   HEALTH CHECK
====================================================== */

// Used by Render / monitoring services
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Store Ratings Backend is running"
  });
});

module.exports = app;
