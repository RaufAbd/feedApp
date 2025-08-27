const path = require("path");
const fs = require("fs");

const clearImage = (filePath) => {
  const fullPath = path.join(__dirname, "../..", filePath);
  fs.unlink(fullPath, (err) => console.log(err));
};

module.exports = clearImage;
