const fs = require('fs');
const { config } = require('../config')

const createFileWithContent = (fileName, content) => {
    fs.writeFileSync(`${config.storage.path}${fileName}`, content, { encoding: "utf-8"})
}

const deleteFile = (fileName) => {
    fs.unlinkSync(`${config.storage.path}${fileName}`)
}

module.exports = { createFileWithContent, deleteFile }
