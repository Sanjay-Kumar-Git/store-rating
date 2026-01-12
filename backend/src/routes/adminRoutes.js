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

// Admin fetches all users
router.get(
  "/users",
  authMiddleware,
  roleMiddleware("admin"),
  getAllUsers
);

// Admin fetches all stores
router.get(
  "/stores",
  authMiddleware,
  roleMiddleware("admin"),
  getAllStores
);

router.delete(
  "/users/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteUser
);

router.delete(
  "/stores/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteStore
);

// Change user role
router.patch(
  "/users/:id/role",
  authMiddleware,
  roleMiddleware("admin"),
  changeUserRole
);

// Download users report
router.get(
  "/reports/users",
  authMiddleware,
  roleMiddleware("admin"),
  getUsersReport
);

// Download stores report
router.get(
  "/reports/stores",
  authMiddleware,
  roleMiddleware("admin"),
  getStoresReport
);

router.get(
  "/users/:id",
  authMiddleware,
  roleMiddleware("admin"),
  getUserById
);

router.get(
  "/users/:id",
  authMiddleware,
  roleMiddleware("admin"),
  getUserById
);

module.exports = router;
