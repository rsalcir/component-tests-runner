const yaml = require('js-yaml');
const fs = require('fs');
const path = require("path");
let configuration = {}

try {
    const settingsPath = path.resolve('../tests_setup.yml');
    const filePath = fs.readFileSync(settingsPath, 'utf8');
    configuration = yaml.load(filePath);
} catch (error) {
    console.error(error);
}

module.exports = { config: configuration}