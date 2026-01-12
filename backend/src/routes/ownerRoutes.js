/**
 * ownerRoutes.js
 * ------------------------------------------------
 * Owner-only routes:
 * - View owner dashboard
 *   (store details, user ratings, average rating)
 */

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const {
  getOwnerDashboard
} = require("../controllers/ownerController");

/* ======================================================
   OWNER DASHBOARD
====================================================== */

// Fetch dashboard data for logged-in owner
router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("owner"),
  getOwnerDashboard
);

module.exports = router;
