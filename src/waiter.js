const axios = require('axios').default
const sleep = require('./features/support/helpers/timer')
const args = process.argv.slice(2);

const check = async (url, timeout) => {
    console.log(`checking ${url} for ${timeout} seconds`)
    for(let count = 0; count < parseInt(timeout, 10); count ++) {
        try {
            const response = await axios.get(url)
            if (response.status == 200) {
                console.log(`App with url ${url} is running, took ${count} seconds`)
                break;
            }
        } catch(ex) {
            await sleep(1000)
            if (count == parseInt(timeout, 10) -1) {
                console.log('app is NOT running')
                process.exit(1)
            }
        }
    }
}

check(args[0], args[1]).then()