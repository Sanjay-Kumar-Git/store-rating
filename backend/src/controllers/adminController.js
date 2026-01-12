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


/**
 * Get all users (admin only)
 */
exports.getAllUsers = (req, res) => {
  db.all(
    `
    SELECT id, name, email, address, role
    FROM users
    ORDER BY id DESC
    `,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: "Failed to fetch users" });
      }
      res.status(200).json(rows);
    }
  );
};

/**
 * Get all stores with average ratings (admin only)
 */
exports.getAllStores = (req, res) => {
  db.all(
    `
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
    LEFT JOIN ratings r ON s.id = r.store_id
    LEFT JOIN users u ON u.id = s.owner_id
    GROUP BY s.id
    ORDER BY s.id DESC
    `,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: "Failed to fetch stores" });
      }

      // 👇 normalize response for frontend
      const formatted = rows.map(row => ({
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

      res.json(formatted);
    }
  );
};


/**
 * Admin deletes a user (user / owner)
 */
exports.deleteUser = (req, res) => {
  const adminId = req.user.id; // from authMiddleware
  const userIdToDelete = req.params.id;

  // Prevent admin deleting themselves
  if (parseInt(adminId) === parseInt(userIdToDelete)) {
    return res.status(400).json({ message: "You cannot delete yourself" });
  }

  // Check user existence and role
  db.get(
    `SELECT role FROM users WHERE id = ?`,
    [userIdToDelete],
    (err, user) => {
      if (err) {
        return res.status(500).json({ message: "Server error" });
      }

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Prevent deleting last admin
      if (user.role === "admin") {
        db.get(
          `SELECT COUNT(*) AS count FROM users WHERE role = 'admin'`,
          [],
          (err, row) => {
            if (row.count <= 1) {
              return res.status(400).json({ message: "Cannot delete last admin" });
            }
            deleteUserNow();
          }
        );
      } else {
        deleteUserNow();
      }
    }
  );

  function deleteUserNow() {
    db.run(
      `DELETE FROM users WHERE id = ?`,
      [userIdToDelete],
      function (err) {
        if (err) {
          return res.status(500).json({ message: "Failed to delete user" });
        }
        res.status(200).json({ message: "User deleted successfully" });
      }
    );
  }
};

exports.deleteStore = (req, res) => {
  const { id } = req.params;

  db.run(
    `DELETE FROM stores WHERE id = ?`,
    [id],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Failed to delete store" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: "Store not found" });
      }

      res.json({ message: "Store deleted successfully" });
    }
  );
};


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

/**
 * Generate USERS CSV report
 */
exports.getUsersReport = (req, res) => {
  const query = `
    SELECT name, email, role, address
    FROM users
    ORDER BY id DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Failed to generate users report" });
    }

    let csv = "Name,Email,Role,Address\n";
    rows.forEach(r => {
      csv += `"${r.name}","${r.email}","${r.role}","${r.address || ""}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=users-report.csv");
    res.send(csv);
  });
};

/**
 * Generate STORES CSV report
 */
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

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Failed to generate stores report" });
    }

    let csv = "Store Name,Owner Name,Owner Email,Average Rating\n";
    rows.forEach(r => {
      csv += `"${r.storeName}","${r.ownerName || ""}","${r.ownerEmail || ""}","${r.averageRating || 0}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=stores-report.csv");
    res.send(csv);
  });
};


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
        if (err) return res.status(500).json({ message: "Failed to count ratings" });

        res.json({
          totalUsers: users.totalUsers,
          totalStores: stores.totalStores,
          totalRatings: ratings.totalRatings
        });
      });
    });
  });
};

exports.getUserById = (req, res) => {
  const userId = req.params.id;

  const userQuery = `
    SELECT id, name, email, address, role
    FROM users
    WHERE id = ?
  `;

  db.get(userQuery, [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch user" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If NOT owner → return basic info
    if (user.role !== "owner") {
      return res.json({ user });
    }

    // If OWNER → fetch store + rating
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
      if (err) {
        return res.status(500).json({ message: "Failed to fetch store" });
      }

      res.json({
        user,
        store: store || null
      });
    });
  });
};
