/**
 * adminRoutes.js
 * ------------------------------------------------
 * Admin-only routes for managing:
 * - Users (create, view, delete, role change)
 * - Stores (create, view, delete)
 * - Reports
 * - Dashboard statistics
 */

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const {
  createUser,
  createStore,
  getAllUsers,
  getAllStores,
  deleteUser,
  deleteStore,
  changeUserRole,
  getUsersReport,
  getStoresReport,
  getAdminDashboard,
  getUserById
} = require("../controllers/adminController");

/* ======================================================
   USER MANAGEMENT
====================================================== */

// Create user (role: user / owner)
router.post(
  "/users",
  authMiddleware,
  roleMiddleware("admin"),
  createUser
);

// Get all users
router.get(
  "/users",
  authMiddleware,
  roleMiddleware("admin"),
  getAllUsers
);

// Get user details by ID
router.get(
  "/users/:id",
  authMiddleware,
  roleMiddleware("admin"),
  getUserById
);

// Delete user
router.delete(
  "/users/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteUser
);

// Change user role (user ↔ owner)
router.patch(
  "/users/:id/role",
  authMiddleware,
  roleMiddleware("admin"),
  changeUserRole
);

/* ======================================================
   STORE MANAGEMENT
====================================================== */

// Create store and assign owner
router.post(
  "/stores",
  authMiddleware,
  roleMiddleware("admin"),
  createStore
);

// Get all stores
router.get(
  "/stores",
  authMiddleware,
  roleMiddleware("admin"),
  getAllStores
);

// Delete store
router.delete(
  "/stores/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteStore
);

/* ======================================================
   REPORTS
====================================================== */

// Download users report (CSV)
router.get(
  "/reports/users",
  authMiddleware,
  roleMiddleware("admin"),
  getUsersReport
);

// Download stores report (CSV)
router.get(
  "/reports/stores",
  authMiddleware,
  roleMiddleware("admin"),
  getStoresReport
);

/* ======================================================
   DASHBOARD
====================================================== */

// Admin dashboard summary
router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("admin"),
  getAdminDashboard
);

module.exports = router;
