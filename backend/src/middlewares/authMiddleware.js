/**
 * authMiddleware.js
 * ------------------------------------------------
 * JWT authentication middleware.
 *
 * - Verifies the Authorization token
 * - Decodes user information from JWT
 * - Attaches user data to req.user
 *
 * Used to protect authenticated routes.
 */

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

/* ======================================================
   AUTHENTICATION MIDDLEWARE
====================================================== */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Ensure Authorization header exists
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authorization token missing"
    });
  }

  // Extract token from header
  const token = authHeader.split(" ")[1];

  try {
    // Verify and decode JWT
    const decodedUser = jwt.verify(token, JWT_SECRET);

    // Attach decoded user data to request
    // Example: { id, role, iat, exp }
    req.user = decodedUser;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

module.exports = authMiddleware;
