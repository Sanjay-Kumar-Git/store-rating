/**
 * server.js
 * -----------
 * Entry point of the backend application.
 * Responsible only for starting the HTTP server.
 */

require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
