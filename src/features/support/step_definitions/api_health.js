const { Given, When, Then } = require('@cucumber/cucumber')
const pactum = require("pactum")

let spec = pactum.spec()

Given('application is started', function() {
    spec.get('http://localhost:8080/health')
})

When('application initializes successfully', async function() {
    await spec.toss()
    spec.response().should.have.status(200)
})