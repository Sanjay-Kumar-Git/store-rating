/**
 * userRoutes.js
 * -------------
 * User-only routes:
 * - View stores with average ratings
 * - Rate or update store ratings
 */

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const {
  getStores,
  rateStore
} = require("../controllers/userController");

// Get all stores with average ratings
router.get(
  "/stores",
  authMiddleware,
  roleMiddleware("user"),
  getStores
);

// Rate or update rating for a store
router.post(
  "/ratings",
  authMiddleware,
  roleMiddleware("user"),
  rateStore
);

module.exports = router;
