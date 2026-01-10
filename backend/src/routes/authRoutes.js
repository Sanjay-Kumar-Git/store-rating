/**
 * authRoutes.js
 * -------------
 * Authentication-related routes:
 * - Signup
 * - Login
 * - Forgot / Reset password
 * - Change password (authenticated)
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

// Public authentication routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected route (requires authentication)
router.patch("/change-password", authMiddleware, changePassword);

module.exports = router;
