/**
 * adminController.js
 * ------------------
 * Handles admin-only operations:
 * - Create users (user / owner)
 * - Create stores and assign owners
 */

const db = require("../config/db");
const bcrypt = require("bcrypt");

/**
 * Admin creates a user (role: user or owner)
 */
exports.createUser = async (req, res) => {
  const { name, email, password, address, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!["user", "owner"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      `
      INSERT INTO users (name, email, password, address, role)
      VALUES (?, ?, ?, ?, ?)
      `,
      [name, email, hashedPassword, address || "", role],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE")) {
            return res.status(409).json({ message: "Email already exists" });
          }
          return res.status(500).json({ message: "User creation failed" });
        }

        res.status(201).json({
          message: "User created successfully",
          userId: this.lastID,
          role
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Admin creates a store and assigns it to an owner
 */
exports.createStore = (req, res) => {
  const { name, email, address, ownerId } = req.body;

  if (!name || !email || !ownerId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  db.run(
    `
    INSERT INTO stores (name, email, address, owner_id)
    VALUES (?, ?, ?, ?)
    `,
    [name, email, address || "", ownerId],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          return res.status(409).json({ message: "Store email already exists" });
        }
        return res.status(500).json({ message: "Store creation failed" });
      }

      res.status(201).json({
        message: "Store created successfully",
        storeId: this.lastID
      });
    }
  );
};
