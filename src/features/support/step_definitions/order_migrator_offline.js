const { Given, When, Then, Before } = require('@cucumber/cucumber')
const { deleteSessions, addSession } =require('../helpers/mockServer')
const { MSSqlDBConnectorInstance } = require('../helpers/mssql')
const { KafkaConsumerConnector } = require('../helpers/kafkaConsumer')
const sleep = require('../helpers/timer')
const { createFileWithContent, deleteFile } = require('../helpers/storage')
const assert = require("assert").strict;
const { config } = require('../config')

Before(async () => {
    if(process.env.STARTUP_MODE == 'migrator-offline'){
        deleteFile("migrator_configuration-0.txt")
        const kafkaConsumer = await KafkaConsumerConnector.getInstance()
        await kafkaConsumer.cleanMessages()
    }
});

Given('I have a file in the cloud storage with delay {string}', async function (delay) {
    await sleep(parseInt(delay, 10))
    const content = `
    Last migration date: 2021-02-03T00:00:00.000Z
    Search range: 1440
    Quantity orders to migrate: 10
    Current number page: 66
    Number pages: 1
    Hostname: migrator-offline-test
    `
    createFileWithContent("migrator_configuration-0.txt", content)
})

Then('order with id {string} has been created in database after migrator-offline runner has executed', {timeout: 60 * 1000}, async function(orderId) {
    let run = true
    let recordset = null
    do {
        const dbConn = await MSSqlDBConnectorInstance.getInstance()
        const result = await dbConn.doOperation(`SELECT * FROM Pedidos WHERE Id = ${parseInt(orderId, 10)}`)
        recordset = result.recordset[0]
        if (recordset) {
            run = false
        }
        await sleep(1000)
    } while(run)
    
    assert.deepStrictEqual(orderId, recordset.Id)
})

Then('order with id {string} not created in database after running migrator-offline runner has executed', {timeout: 60 * 1000}, async function(orderId) {
    const dbConn = await MSSqlDBConnectorInstance.getInstance()
    const result = await dbConn.doOperation(`SELECT * FROM Pedidos WHERE Id = ${orderId}`)

    let orderIdObtained = result.recordset[0]

    assert.deepStrictEqual(undefined, orderIdObtained)
})

Then("i should send the message {string} to kafka topic {string}", {timeout: 60 * 2000}, async function (payload, topic) {
    const kafkaConsumer = await KafkaConsumerConnector.getInstance()
    while (kafkaConsumer.checkMessages(topic).length === 0) {
        await sleep(1000)
    }
    const messages = kafkaConsumer.checkMessages(topic)
    for (let amount = 0; amount < messages.length; amount++) {
        assert.deepStrictEqual(messages[amount], payload)
     }
})