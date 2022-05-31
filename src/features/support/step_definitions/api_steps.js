const { Before, Given, When, Then } = require('@cucumber/cucumber')
const pactum = require('pactum')
const { deleteSessions, addSession, deleteRequestFiles } = require('../helpers/mockServer')

let spec = pactum.spec();
Before(async () => {
    spec = pactum.spec();
    deleteSessions()
    deleteRequestFiles("./sessions")
});

Given("i have a session called {string}", async function(sessionName) {
    await addSession(sessionName)
})

When("i make a get request to {string}", async function (url) {
    spec.get(url);
});

Then("i receive the response", async function () {
    await spec.toss();
});

Then("response should have status code {int}", async function (code) {
    spec.response().should.have.status(code);
});

Then("response should have body {string}", async function (body) {
    const obj = JSON.parse(body);
    spec.response().to.have.jsonLike(obj);
});