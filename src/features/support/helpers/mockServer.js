const axios = require('axios');
const fs = require('fs');
const path = require('path')
const { config } = require('../config')

const deleteSessions = async () => {
    await axios.delete(`${config.services.mockServer.host}/sessions/current`)
}

const addSession = async (sessionName) => {
    await axios.post(`${config.services.mockServer.host}/sessions/current`, { name: sessionName.replace(/ /g, '_') }, {headers: {'Content-Type': 'application/json'}})
}

const deleteRequestFiles = (directory) => {
    try {
        const files = fs.readdirSync(directory)
        for(let amountFile = 0; amountFile < files.length; amountFile++) {
            const currentDirectoryOrFile = path.join(directory, files[amountFile])
            if (fs.statSync(currentDirectoryOrFile).isDirectory()) {
                deleteRequestFiles(currentDirectoryOrFile)
            }

            if (currentDirectoryOrFile.includes('.req.json')) {
                fs.unlinkSync(`./${currentDirectoryOrFile}`)
            }
        }
    } catch (error) {
        console.error(`Got an error ${error}`)
    }
}

const getFiles = (fileNameStart, sessionName) => {
    const filesFound = []
    const files = fs.readdirSync(`./sessions/${sessionName.replace(/ /g, '_')}`)
    for(let amountFile = 0; amountFile < files.length; amountFile++) {
        const currentDirectoryOrFile = path.join(`./sessions/${sessionName.replace(/ /g, '_')}`, files[amountFile])
        if (currentDirectoryOrFile.includes(`${fileNameStart}.req.json`)) {
            filesFound.push(path.join(`./sessions/${sessionName.replace(/ /g, '_')}`, files[amountFile]))
        }
    }

    return filesFound
}

const getFileContent = (fileName) => {
    return fs.readFileSync(fileName, { encoding: 'utf-8', flag: 'r'})
}

const checkRequestWasMade = (fileNameStart, sessionName) => {
    const expectedFileName = `sessions/${sessionName.replace(/ /g, '_')}/${fileNameStart}.req.json`
    return getFiles(fileNameStart, sessionName).includes(expectedFileName)
}

const checkNumberOfRequestWasMade = (fileNameStart, sessionName, requestAmount) => {
    const files = getFiles(fileNameStart, sessionName)
    return files.length == requestAmount
}

const checkRequestIsValid = (fileNameStart, sessionName, request) => {
    const files = getFiles(fileNameStart, sessionName)
    let succeed = false;
    for(let amountFile = 0; amountFile < files.length; amountFile++) {
        const fileObject = JSON.parse(getFileContent(files[amountFile], sessionName))
        const contentAsString = JSON.stringify(fileObject.body)
        succeed = request === contentAsString
    }

    return succeed
}

module.exports = { addSession, deleteSessions, deleteRequestFiles, checkRequestWasMade, checkRequestIsValid, checkNumberOfRequestWasMade }