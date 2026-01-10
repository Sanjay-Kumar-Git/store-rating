/**
 * roleMiddleware.js
 * -----------------
 * Restricts access to routes based on user role.
 * Usage: roleMiddleware("admin" | "user" | "owner")
 */

/**
 * Role-based authorization middleware
 * @param {string} requiredRole
 */
const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

module.exports = roleMiddleware;
