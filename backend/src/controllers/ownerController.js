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

  // Fetch store owned by this owner
  db.get(
    `
    SELECT id, name, address
    FROM stores
    WHERE owner_id = ?
    `,
    [ownerId],
    (err, store) => {
      if (err) {
        return res.status(500).json({ message: "Failed to fetch store" });
      }

      if (!store) {
        return res.status(404).json({ message: "No store found for owner" });
      }

      // Fetch all ratings for the store
      db.all(
        `
        SELECT 
          users.name AS userName,
          ratings.rating
        FROM ratings
        JOIN users ON ratings.user_id = users.id
        WHERE ratings.store_id = ?
        `,
        [store.id],
        (err, ratings) => {
          if (err) {
            return res.status(500).json({ message: "Failed to fetch ratings" });
          }

          // Calculate average rating for the store
          db.get(
            `
            SELECT AVG(rating) AS averageRating
            FROM ratings
            WHERE store_id = ?
            `,
            [store.id],
            (err, avgRow) => {
              if (err) {
                return res
                  .status(500)
                  .json({ message: "Failed to calculate average rating" });
              }

              res.status(200).json({
                store,
                averageRating: avgRow.averageRating,
                ratings
              });
            }
          );
        }
      );
    }
  );
};
