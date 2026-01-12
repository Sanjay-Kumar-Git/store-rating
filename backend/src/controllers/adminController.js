/**
 * adminController.js
 * ------------------------------------------------
 * Admin-only operations:
 * - Create users (user / owner)
 * - Create stores and assign owners
 * - Manage users, roles, and stores
 * - Generate reports
 * - Dashboard statistics
 */

const db = require("../config/db");
const bcrypt = require("bcrypt");

/* ======================================================
   CREATE USER (USER / OWNER)
====================================================== */
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

    const query = `
      INSERT INTO users (name, email, password, address, role)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.run(
      query,
      [name, email, hashedPassword, address || "", role],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE")) {
            return res.status(409).json({ message: "Email already exists" });
          }
          return res.status(500).json({ message: "Failed to create user" });
        }

        res.status(201).json({
          message: "User created successfully",
          userId: this.lastID,
          role
        });
      }
    );
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   CREATE STORE & ASSIGN OWNER
====================================================== */
exports.createStore = (req, res) => {
  const { name, email, address, ownerId } = req.body;

  if (!name || !email || !ownerId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const query = `
    INSERT INTO stores (name, email, address, owner_id)
    VALUES (?, ?, ?, ?)
  `;

  db.run(query, [name, email, address || "", ownerId], function (err) {
    if (err) {
      if (err.message.includes("UNIQUE")) {
        return res.status(409).json({ message: "Store email already exists" });
      }
      return res.status(500).json({ message: "Failed to create store" });
    }

    res.status(201).json({
      message: "Store created successfully",
      storeId: this.lastID
    });
  });
};

/* ======================================================
   GET ALL USERS
====================================================== */
exports.getAllUsers = (req, res) => {
  const query = `
    SELECT id, name, email, address, role
    FROM users
    ORDER BY id DESC
  `;

  db.all(query, [], (err, users) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch users" });
    }
    res.json(users);
  });
};

/* ======================================================
   GET ALL STORES WITH AVERAGE RATINGS
====================================================== */
exports.getAllStores = (req, res) => {
  const query = `
    SELECT 
      s.id,
      s.name,
      s.email,
      s.address,
      ROUND(AVG(r.rating), 1) AS averageRating,
      u.id AS ownerId,
      u.name AS ownerName,
      u.email AS ownerEmail
    FROM stores s
    LEFT JOIN ratings r ON r.store_id = s.id
    LEFT JOIN users u ON u.id = s.owner_id
    GROUP BY s.id
    ORDER BY s.id DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch stores" });
    }

    const stores = rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      address: row.address,
      averageRating: row.averageRating,
      owner: row.ownerId
        ? {
            id: row.ownerId,
            name: row.ownerName,
            email: row.ownerEmail
          }
        : null
    }));

    res.json(stores);
  });
};

/* ======================================================
   DELETE USER (SAFE)
====================================================== */
exports.deleteUser = (req, res) => {
  const adminId = Number(req.user.id);
  const userId = Number(req.params.id);

  if (adminId === userId) {
    return res.status(400).json({ message: "You cannot delete yourself" });
  }

  db.get(`SELECT role FROM users WHERE id = ?`, [userId], (err, user) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent deleting the last admin
    if (user.role === "admin") {
      db.get(
        `SELECT COUNT(*) AS count FROM users WHERE role = 'admin'`,
        [],
        (err, result) => {
          if (result.count <= 1) {
            return res
              .status(400)
              .json({ message: "Cannot delete the last admin" });
          }
          deleteUser();
        }
      );
    } else {
      deleteUser();
    }
  });

  function deleteUser() {
    db.run(`DELETE FROM users WHERE id = ?`, [userId], function (err) {
      if (err) {
        return res.status(500).json({ message: "Failed to delete user" });
      }
      res.json({ message: "User deleted successfully" });
    });
  }
};

/* ======================================================
   DELETE STORE
====================================================== */
exports.deleteStore = (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM stores WHERE id = ?`, [id], function (err) {
    if (err) {
      return res.status(500).json({ message: "Failed to delete store" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: "Store not found" });
    }

    res.json({ message: "Store deleted successfully" });
  });
};

/* ======================================================
   CHANGE USER ROLE
====================================================== */
exports.changeUserRole = (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!["user", "owner"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  db.run(
    `UPDATE users SET role = ? WHERE id = ?`,
    [role, id],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Failed to update role" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "Role updated successfully" });
    }
  );
};

/* ======================================================
   USERS CSV REPORT
====================================================== */
exports.getUsersReport = (req, res) => {
  const query = `
    SELECT name, email, role, address
    FROM users
    ORDER BY id DESC
  `;

  db.all(query, [], (err, users) => {
    if (err) {
      return res.status(500).json({ message: "Failed to generate users report" });
    }

    let csv = "Name,Email,Role,Address\n";
    users.forEach(u => {
      csv += `"${u.name}","${u.email}","${u.role}","${u.address || ""}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=users-report.csv"
    );
    res.send(csv);
  });
};

/* ======================================================
   STORES CSV REPORT
====================================================== */
exports.getStoresReport = (req, res) => {
  const query = `
    SELECT 
      s.name AS storeName,
      u.name AS ownerName,
      u.email AS ownerEmail,
      ROUND(AVG(r.rating), 1) AS averageRating
    FROM stores s
    LEFT JOIN users u ON u.id = s.owner_id
    LEFT JOIN ratings r ON r.store_id = s.id
    GROUP BY s.id
    ORDER BY s.id DESC
  `;

  db.all(query, [], (err, stores) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Failed to generate stores report" });
    }

    let csv = "Store Name,Owner Name,Owner Email,Average Rating\n";
    stores.forEach(s => {
      csv += `"${s.storeName}","${s.ownerName || ""}","${s.ownerEmail || ""}","${s.averageRating || 0}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=stores-report.csv"
    );
    res.send(csv);
  });
};

/* ======================================================
   ADMIN DASHBOARD STATS
====================================================== */
exports.getAdminDashboard = (req, res) => {
  const queries = {
    users: "SELECT COUNT(*) AS totalUsers FROM users",
    stores: "SELECT COUNT(*) AS totalStores FROM stores",
    ratings: "SELECT COUNT(*) AS totalRatings FROM ratings"
  };

  db.get(queries.users, [], (err, users) => {
    if (err) return res.status(500).json({ message: "Failed to count users" });

    db.get(queries.stores, [], (err, stores) => {
      if (err) return res.status(500).json({ message: "Failed to count stores" });

      db.get(queries.ratings, [], (err, ratings) => {
        if (err)
          return res.status(500).json({ message: "Failed to count ratings" });

        res.json({
          totalUsers: users.totalUsers,
          totalStores: stores.totalStores,
          totalRatings: ratings.totalRatings
        });
      });
    });
  });
};

/* ======================================================
   GET USER BY ID (ADMIN VIEW)
====================================================== */
exports.getUserById = (req, res) => {
  const userId = req.params.id;

  const userQuery = `
    SELECT id, name, email, address, role
    FROM users
    WHERE id = ?
  `;

  db.get(userQuery, [userId], (err, user) => {
    if (err) return res.status(500).json({ message: "Failed to fetch user" });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "owner") {
      return res.json({ user });
    }

    const storeQuery = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        ROUND(AVG(r.rating), 1) AS averageRating
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE s.owner_id = ?
      GROUP BY s.id
    `;

    db.get(storeQuery, [userId], (err, store) => {
      if (err)
        return res.status(500).json({ message: "Failed to fetch store" });

      res.json({
        user,
        store: store || null
      });
    });
  });
};
