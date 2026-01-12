/**
 * userRoutes.js
 * ------------------------------------------------
 * User-only routes:
 * - View all stores with average ratings
 * - Submit or update store ratings
 */

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const {
  getStores,
  rateStore
} = require("../controllers/userController");

/* ======================================================
   STORE LISTING
====================================================== */

// Fetch all stores with average rating & user's rating
router.get(
  "/stores",
  authMiddleware,
  roleMiddleware("user"),
  getStores
);

/* ======================================================
   STORE RATING
====================================================== */

// Submit or update rating for a store
router.post(
  "/ratings",
  authMiddleware,
  roleMiddleware("user"),
  rateStore
);

module.exports = router;
