/**
 * userController.js
 * -----------------
 * Handles user-facing operations:
 * - View stores with average ratings
 * - Rate or update rating for a store
 */

const db = require("../config/db");

/**
 * Get all stores with their average rating
 */
exports.getStores = (req, res) => {
  const query = `
    SELECT 
      stores.id,
      stores.name,
      stores.address,
      AVG(ratings.rating) AS averageRating
    FROM stores
    LEFT JOIN ratings ON stores.id = ratings.store_id
    GROUP BY stores.id
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch stores" });
    }

    res.status(200).json(rows);
  });
};

/**
 * Rate a store or update existing rating
 * - Rating must be between 1 and 5
 * - One rating per user per store
 */
exports.rateStore = (req, res) => {
  const userId = req.user.id;
  const { storeId, rating } = req.body;

  if (!storeId || !rating) {
    return res.status(400).json({ message: "Store ID and rating required" });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  // Check if user already rated this store
  db.get(
    `
    SELECT id FROM ratings
    WHERE user_id = ? AND store_id = ?
    `,
    [userId, storeId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ message: "Failed to rate store" });
      }

      if (row) {
        // Update existing rating
        db.run(
          `
          UPDATE ratings
          SET rating = ?, created_at = CURRENT_TIMESTAMP
          WHERE user_id = ? AND store_id = ?
          `,
          [rating, userId, storeId],
          () => {
            res.status(200).json({ message: "Rating updated successfully" });
          }
        );
      } else {
        // Insert new rating
        db.run(
          `
          INSERT INTO ratings (user_id, store_id, rating)
          VALUES (?, ?, ?)
          `,
          [userId, storeId, rating],
          () => {
            res.status(201).json({ message: "Rating submitted successfully" });
          }
        );
      }
    }
  );
};
