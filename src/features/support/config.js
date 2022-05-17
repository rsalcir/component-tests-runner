const path = require("path");
const fs = require("fs");

const settingsPath = path.resolve('./features/config.json');
const settingsFile = fs.readFileSync(settingsPath);
module.exports = { config: JSON.parse(settingsFile)}