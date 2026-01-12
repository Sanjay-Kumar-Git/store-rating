/**
 * ownerController.js
 * ------------------
 * Handles owner-only operations:
 * - View owned store details
 * - View ratings and average rating for the store
 */

const db = require("../config/db");

/**
 * Get owner dashboard
 * Returns:
 * - Store details
 * - Average rating
 * - List of user ratings
 */
exports.getOwnerDashboard = (req, res) => {
  const ownerId = req.user.id;

  // 1. Get store owned by this owner
  const storeQuery = `
    SELECT id, name, address
    FROM stores
    WHERE owner_id = ?
  `;

  db.get(storeQuery, [ownerId], (err, store) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch store" });
    }

    if (!store) {
      return res.status(404).json({ message: "No store found for this owner" });
    }

    // 2. Get ratings + usernames
    const ratingsQuery = `
      SELECT 
        u.name AS userName,
        r.rating
      FROM ratings r
      JOIN users u ON u.id = r.user_id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
    `;

    db.all(ratingsQuery, [store.id], (err, ratings) => {
      if (err) {
        return res.status(500).json({ message: "Failed to fetch ratings" });
      }

      // 3. Get average rating
      const avgQuery = `
        SELECT ROUND(AVG(rating), 1) AS averageRating
        FROM ratings
        WHERE store_id = ?
      `;

      db.get(avgQuery, [store.id], (err, avg) => {
        if (err) {
          return res.status(500).json({ message: "Failed to calculate average rating" });
        }

        res.json({
          store,
          averageRating: avg.averageRating || 0,
          ratings
        });
      });
    });
  });
};

