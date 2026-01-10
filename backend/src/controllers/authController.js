/**
 * authController.js
 * -----------------
 * Handles authentication and password lifecycle:
 * - User signup
 * - Login (all roles)
 * - Forgot password
 * - Reset password
 * - Change password (logged-in users)
 */

const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * User signup (role is always "user")
 */
exports.signup = async (req, res) => {
  const { name, email, password, address } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      `
      INSERT INTO users (name, email, password, address, role)
      VALUES (?, ?, ?, ?, ?)
      `,
      [name, email, hashedPassword, address || "", "user"],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE")) {
            return res.status(409).json({ message: "Email already exists" });
          }
          return res.status(500).json({ message: "Signup failed" });
        }

        res.status(201).json({
          message: "User registered successfully",
          userId: this.lastID
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Login (admin / user / owner)
 */
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  db.get(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ message: "Server error" });
      }

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.status(200).json({
        message: "Login successful",
        token,
        role: user.role
      });
    }
  );
};

/**
 * Forgot password (generate reset token)
 */
exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes

  db.run(
    `
    UPDATE users
    SET reset_token = ?, reset_token_expiry = ?
    WHERE email = ?
    `,
    [resetToken, expiry, email],
    function (err) {
      if (err || this.changes === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      // In real applications, this token would be emailed
      res.json({
        message: "Password reset token generated",
        resetToken
      });
    }
  );
};

/**
 * Reset password using reset token
 */
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      message: "Token and new password required"
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  db.run(
    `
    UPDATE users
    SET password = ?, reset_token = NULL, reset_token_expiry = NULL
    WHERE reset_token = ?
      AND reset_token_expiry > ?
    `,
    [hashedPassword, token, Date.now()],
    function (err) {
      if (err || this.changes === 0) {
        return res.status(400).json({
          message: "Invalid or expired token"
        });
      }

      res.json({ message: "Password reset successful" });
    }
  );
};

/**
 * Change password (logged-in user)
 */
exports.changePassword = async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      message: "Old password and new password are required"
    });
  }

  db.get(
    "SELECT password FROM users WHERE id = ?",
    [userId],
    async (err, user) => {
      if (err || !user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Old password is incorrect" });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      db.run(
        "UPDATE users SET password = ? WHERE id = ?",
        [hashedNewPassword, userId],
        () => {
          res.json({ message: "Password updated successfully" });
        }
      );
    }
  );
};
