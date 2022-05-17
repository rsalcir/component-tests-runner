const { execSync } = require('child_process')
const { config } = require('../config')

const runSeedDatabase = async () => {
    const { seedConfig } = config
    seedConfig.commands.forEach((command) => {
        try {
            execSync(command)
        } catch(err) {
            console.error(err)
        }
    })
}

module.exports = { runSeedDatabase }