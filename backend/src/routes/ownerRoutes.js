/**
 * ownerRoutes.js
 * --------------
 * Owner-only routes:
 * - View owner dashboard (store details, ratings, average rating)
 */

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { getOwnerDashboard } = require("../controllers/ownerController");

// Owner dashboard
router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("owner"),
  getOwnerDashboard
);

module.exports = router;
