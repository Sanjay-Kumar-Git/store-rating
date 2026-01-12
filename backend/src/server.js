/**
 * server.js
 * ------------------------------------------------
 * Application entry point.
 *
 * Responsibilities:
 * - Load environment variables
 * - Start the HTTP server
 */

require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 5000;

/* ======================================================
   START SERVER
====================================================== */

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
