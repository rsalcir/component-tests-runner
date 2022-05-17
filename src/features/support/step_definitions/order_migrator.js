const { Given, When, Then, Before } = require('@cucumber/cucumber')
const { deleteSessions, addSession } = require('../helpers/mockServer')
const { MongoDbConnectorInstance } = require('../helpers/mongodb')
const { MSSqlDBConnectorInstance } = require('../helpers/mssql')
const { KafkaConnector, sendMessage } = require('../helpers/kafkaProducer')
const { KafkaConsumerConnector } = require("../helpers/kafkaConsumer")
const { checkRequestWasMade } = require('../helpers/mockServer')
const sleep = require('../helpers/timer')
const assert = require("assert").strict;

Before(async () => {
  await deleteSessions()
  const instance = await MongoDbConnectorInstance.getInstance()
  instance.deleteAllDocuments("StateMachine")
  const mssql = await MSSqlDBConnectorInstance.getInstance()
  await mssql.deleteAll()
});

Given("Im in session that {string}", async function(sessionName) {
    await addSession(sessionName)
})

Given("this order with PedidoIdPlataformaIhub {string} and id {string} already exists in FISIA database", async function(originOrderId, scoobyId) {
    const dbConn = await MSSqlDBConnectorInstance.getInstance()
    await dbConn.insertDataIntoPedidoTable(scoobyId, originOrderId)
    await sleep(1000)
})

When('in topic {string} a message {string} arrives', async function(topicName, message) {
    const kafkaConnector = await KafkaConnector.getInstance()
    await sendMessage(kafkaConnector, topicName, message)
})

Then("i should receive the message {string} from kafka topic {string}", async function (payload, topic) {
    const kafkaConsumer = await KafkaConsumerConnector.getInstance()
    while (kafkaConsumer.checkMessages(topic).length === 0) {
        await sleep(1000)
    }
    const messages = kafkaConsumer.checkMessages(topic)
    for (let amount = 0; amount < messages.length; amount++) {
        const message = messages[amount]
        assert.deepStrictEqual(message, payload)
    }
})

Then('a document is created in mongo collection {string} with _id {string} and status {string}', async function(collection, mongoId, status) {
    await sleep(3000)
    const instance = await MongoDbConnectorInstance.getInstance()
    const docsFound = await instance.getDocuments(collection, {})
    assert.deepStrictEqual(docsFound[0]._id, mongoId)
    assert.deepStrictEqual(docsFound[0].status, status)
})

Then('this document in collection {string} _id {string} has {int} actions', async function(collection, orderId, actionsAmount, table) {
    await sleep(3000)
    const instance = await MongoDbConnectorInstance.getInstance()
    const docsFound = await instance.getDocuments(collection, {_id: orderId})
    for (let amount = 0; amount < actionsAmount; amount++) {
        const actions = docsFound[0].actions
        const expectedAction = JSON.parse(table.raw()[amount][0])
        const keys  = Object.keys(expectedAction)
        for (const key of keys) {
            assert.deepStrictEqual(actions[amount][key], expectedAction[key])
        }
    }
})

Then('has a document in collection {string} _id {string}', async function(collection, orderId, table) {
    await sleep(3000)
    const instance = await MongoDbConnectorInstance.getInstance()
    const docsFound = await instance.getDocuments(collection, {_id: orderId})
    for (let amount = 0; amount < table.raw().length; amount++) {
        const expectedDocument = JSON.parse(table.raw()[amount][0])
        const keys = Object.keys(expectedDocument)
        for (const key of keys) {
            assert.deepStrictEqual(docsFound[amount][key], expectedDocument[key])
        }
    }
})

Then('this document in collection {string} _id {string} DOES NOT have action {string}', async function(collection, orderId, orderStatusInAction) {
    await sleep(3000)
    const instance = await MongoDbConnectorInstance.getInstance()
    const docsFound = await instance.getDocuments(collection, {_id: orderId})
    const actions = docsFound[0].actions

    const actionFound = actions.filter((action) => (action.orderStatus == orderStatusInAction))
    assert.deepStrictEqual(actionFound, [])
})

Then('I expect that there are a collection of {string} with orderId as {int}', async function (collection, orderId) {
    const instance = await MongoDbConnectorInstance.getInstance()
    const docsFound = await instance.getDocuments(collection)
    assert.deepStrictEqual(docsFound[0]._id, orderId)
})

Then('order with id {string} has been created in database', async function(orderId) {
    const dbConn = await MSSqlDBConnectorInstance.getInstance()
    const result = await dbConn.doOperation(`SELECT * FROM Pedidos WHERE PedidoIdPlataformaIhub = ${orderId}`)
    const orderIdFound = result.recordset[0].PedidoIdPlataformaIhub
    assert.deepStrictEqual(orderId, orderIdFound)
})

Then('order with id {string} has not been created in database', async function(orderId) {
    const dbConn = await MSSqlDBConnectorInstance.getInstance()
    const result = await dbConn.doOperation(`SELECT * FROM Pedidos WHERE PedidoIdPlataformaIhub = ${orderId}`)
    const orderIdFound = result.recordset[0]
    assert.deepStrictEqual(undefined, orderIdFound)
})

Then('order with id {string} been created in database', async function(orderId) {
    const dbConn = await MSSqlDBConnectorInstance.getInstance()
    const result = await dbConn.doOperation(`SELECT * FROM Pedidos WHERE Id = ${orderId}`)
    const orderIdFound = result.recordset[0]
    assert.deepStrictEqual(orderId, orderIdFound)
})

Then('request to {string} in session {string} was done successfully', async function(apiName, sessionName) {
    const succeed = checkRequestWasMade(apiName, sessionName)
    assert.ok(succeed)
})

When('i make a request to {string} in session {string}', async function(apiName, sessionName) {
    const succeed = checkRequestWasMade(apiName, sessionName)
    assert.ok(succeed)
})


