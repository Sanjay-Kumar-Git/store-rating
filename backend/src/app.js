/**
 * app.js
 * -------
 * Core Express application configuration.
 * Responsible for middleware setup, routes, and health checks.
 */

const express = require("express");
const cors = require("cors");

// Routes
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const ownerRoutes = require("./routes/ownerRoutes");

// Database & seed
require("./config/db");
const seedDatabase = require("./utils/seed");

const app = express();

// Initialize database schema and seed data
seedDatabase();

// Global middlewares
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/owner", ownerRoutes);

// Health check (used by Render / monitoring)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Store Ratings Backend is running"
  });
});

module.exports = app;
