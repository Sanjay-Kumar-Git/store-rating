/**
 * authController.js
 * ------------------------------------------------
 * Handles authentication and password lifecycle:
 * - User signup
 * - Login (admin / user / owner)
 * - Forgot password
 * - Reset password
 * - Change password (authenticated users)
 */

const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET;

/* ======================================================
   USER SIGNUP (ROLE = USER ONLY)
====================================================== */
exports.signup = async (req, res) => {
  const { name, email, password, address } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (name, email, password, address, role)
      VALUES (?, ?, ?, ?, 'user')
    `;

    db.run(
      query,
      [name, email, hashedPassword, address || ""],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE")) {
            return res.status(409).json({ message: "Email already exists" });
          }
          return res.status(500).json({ message: "User signup failed" });
        }

        res.status(201).json({
          message: "User registered successfully",
          userId: this.lastID
        });
      }
    );
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   LOGIN (ADMIN / USER / OWNER)
====================================================== */
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required"
    });
  }

  db.get(
    `SELECT * FROM users WHERE email = ?`,
    [email],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ message: "Server error" });
      }

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.json({
        message: "Login successful",
        token,
        role: user.role
      });
    }
  );
};

/* ======================================================
   FORGOT PASSWORD (GENERATE RESET TOKEN)
====================================================== */
exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const tokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

  const query = `
    UPDATE users
    SET reset_token = ?, reset_token_expiry = ?
    WHERE email = ?
  `;

  db.run(query, [resetToken, tokenExpiry, email], function (err) {
    if (err || this.changes === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // In real apps, this token should be emailed
    res.json({
      message: "Password reset token generated",
      resetToken
    });
  });
};

/* ======================================================
   RESET PASSWORD USING TOKEN
====================================================== */
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      message: "Reset token and new password are required"
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const query = `
    UPDATE users
    SET password = ?, reset_token = NULL, reset_token_expiry = NULL
    WHERE reset_token = ?
      AND reset_token_expiry > ?
  `;

  db.run(query, [hashedPassword, token, Date.now()], function (err) {
    if (err || this.changes === 0) {
      return res.status(400).json({
        message: "Invalid or expired reset token"
      });
    }

    res.json({ message: "Password reset successful" });
  });
};

/* ======================================================
   CHANGE PASSWORD (LOGGED-IN USER)
====================================================== */
exports.changePassword = async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      message: "Old password and new password are required"
    });
  }

  db.get(
    `SELECT password FROM users WHERE id = ?`,
    [userId],
    async (err, user) => {
      if (err || !user) {
        return res.status(404).json({ message: "User not found" });
      }

      const passwordMatch = await bcrypt.compare(
        oldPassword,
        user.password
      );

      if (!passwordMatch) {
        return res
          .status(401)
          .json({ message: "Old password is incorrect" });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      db.run(
        `UPDATE users SET password = ? WHERE id = ?`,
        [hashedNewPassword, userId],
        () => {
          res.json({ message: "Password updated successfully" });
        }
      );
    }
  );
};
