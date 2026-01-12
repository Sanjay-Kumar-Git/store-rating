/**
 * userController.js
 * ------------------------------------------------
 * Handles user-facing operations:
 * - View all stores with average ratings
 * - View user's own rating (if any)
 * - Submit or update store ratings
 */

const db = require("../config/db");

/* ======================================================
   GET STORES (WITH AVERAGE + USER RATING)
====================================================== */
/**
 * Returns:
 * - Store details
 * - Overall average rating
 * - Logged-in user's rating (if exists)
 */
exports.getStores = (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT
      s.id,
      s.name,
      s.address,
      ROUND(AVG(r.rating), 1) AS averageRating,
      ur.rating AS myRating
    FROM stores s
    LEFT JOIN ratings r
      ON r.store_id = s.id
    LEFT JOIN ratings ur
      ON ur.store_id = s.id
     AND ur.user_id = ?
    GROUP BY s.id
  `;

  db.all(query, [userId], (err, stores) => {
    if (err) {
      console.error("Error fetching stores:", err);
      return res.status(500).json({
        message: "Failed to fetch stores"
      });
    }

    res.json(stores);
  });
};

/* ======================================================
   RATE / UPDATE STORE RATING
====================================================== */
/**
 * Rules:
 * - Rating must be between 1 and 5
 * - One rating per user per store
 * - Existing rating will be updated
 */
exports.rateStore = (req, res) => {
  const userId = req.user.id;
  const { storeId, rating } = req.body;

  if (!storeId || rating === undefined) {
    return res.status(400).json({
      message: "Store ID and rating are required"
    });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({
      message: "Rating must be between 1 and 5"
    });
  }

  /* -----------------------------------------------
     Check if user already rated this store
  ------------------------------------------------ */
  const checkQuery = `
    SELECT id
    FROM ratings
    WHERE user_id = ? AND store_id = ?
  `;

  db.get(checkQuery, [userId, storeId], (err, existingRating) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to process rating"
      });
    }

    // Update existing rating
    if (existingRating) {
      const updateQuery = `
        UPDATE ratings
        SET rating = ?, created_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND store_id = ?
      `;

      db.run(updateQuery, [rating, userId, storeId], () => {
        res.json({ message: "Rating updated successfully" });
      });

      return;
    }

    // Insert new rating
    const insertQuery = `
      INSERT INTO ratings (user_id, store_id, rating)
      VALUES (?, ?, ?)
    `;

    db.run(insertQuery, [userId, storeId, rating], () => {
      res.status(201).json({
        message: "Rating submitted successfully"
      });
    });
  });
};
