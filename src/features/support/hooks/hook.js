const { BeforeAll, AfterAll } = require('@cucumber/cucumber')
const { MongoDbConnectorInstance } = require('../helpers/mongodb')
const { MSSqlDBConnectorInstance } = require('../helpers/mssql')
const { KafkaConnector, disconnect } = require('../helpers/kafkaProducer')
const { KafkaConsumerConnector } = require('../helpers/kafkaConsumer')
const { runSeedDatabase } = require('../helpers/commands')

BeforeAll({timeout: 60*1000}, async function() {
    await MongoDbConnectorInstance.getInstance()
    await KafkaConnector.getInstance()
    await KafkaConsumerConnector.getInstance()
    await MSSqlDBConnectorInstance.getInstance()
    await runSeedDatabase()
})

AfterAll(async function() {
    const instance = await MongoDbConnectorInstance.getInstance()
    await instance.disconnect()
    await disconnect(await KafkaConnector.getInstance())
    const kafkaConsumer = await KafkaConsumerConnector.getInstance()
    await disconnect(kafkaConsumer.getConsumer())
    const mssqlIntance = await MSSqlDBConnectorInstance.getInstance()
    await mssqlIntance.disconnect()
})