/**
 * adminRoutes.js
 * --------------
 * Admin-only routes:
 * - Create users (user / owner)
 * - Create stores and assign owners
 */

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const {
  createUser,
  createStore
} = require("../controllers/adminController");

// Admin creates a user (user or owner)
router.post(
  "/users",
  authMiddleware,
  roleMiddleware("admin"),
  createUser
);

// Admin creates a store and assigns an owner
router.post(
  "/stores",
  authMiddleware,
  roleMiddleware("admin"),
  createStore
);

module.exports = router;
