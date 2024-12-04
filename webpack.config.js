const path = require("path");

module.exports = {
  entry: "./src/content.js", // Your main script file
  output: {
    filename: "content.bundle.js", // Bundled output
    path: path.resolve(__dirname, "dist"),
  },
  mode: "production",
};