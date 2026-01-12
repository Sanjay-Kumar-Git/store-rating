/**
 * authRoutes.js
 * ------------------------------------------------
 * Authentication-related routes:
 * - User signup
 * - Login (admin / user / owner)
 * - Forgot password
 * - Reset password
 * - Change password (authenticated users)
 */

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  changePassword
} = require("../controllers/authController");

/* ======================================================
   PUBLIC AUTH ROUTES
====================================================== */

// Register a new user (role = user)
router.post("/signup", signup);

// Login for all roles
router.post("/login", login);

// Generate password reset token
router.post("/forgot-password", forgotPassword);

// Reset password using token
router.post("/reset-password", resetPassword);

/* ======================================================
   PROTECTED AUTH ROUTES
====================================================== */

// Change password (requires authentication)
router.patch(
  "/change-password",
  authMiddleware,
  changePassword
);

module.exports = router;
