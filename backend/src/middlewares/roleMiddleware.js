/**
 * roleMiddleware.js
 * ------------------------------------------------
 * Role-based authorization middleware.
 *
 * Restricts access to routes based on user role.
 *
 * Usage:
 *   roleMiddleware("admin")
 *   roleMiddleware("user")
 *   roleMiddleware("owner")
 */

 /**
  * Checks whether the authenticated user
  * has the required role to access a route.
  *
  * @param {string} requiredRole - Allowed role for the route
  */
const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    // Ensure authentication middleware has run
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized access"
      });
    }

    // Check role authorization
    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
