const Kafka = require('node-rdkafka')
const { config } = require('../config')

const kafkaConfig = {
    'metadata.broker.list': config.kafka.hosts,
    'sasl.mechanism': 'PLAIN',
    'sasl.mechanisms': 'PLAIN',
    'group.id': config.kafka.producer.group,
    'security.protocol': 'SASL_PLAINTEXT',
    'sasl.username': config.kafka.username,
    'sasl.password': config.kafka.password,
}

const createProducer = () => {
    return new Promise((resolve, reject) => {
       try {
           const producer = new Kafka.Producer(kafkaConfig, { acks: -1, 'request.required.acks': -1})
           producer.on('ready', () => { 
                resolve(producer)
           })
 
            producer.on('connection.failure', () => { 
                console.error('Producer could not connect to server => request timeout')
            })
 
            producer.on('event.error', (error) => {
                console.error(`An Error happened to producer => ${JSON.stringify(error)}`)
            })
            producer.connect()
       } catch (error) {
           reject(error)
       } 
    })
}

class KafkaConnector {
   instance = null
   static async getInstance() {
       if (!this.instance) {
           try {
               this.instance = await createProducer()
           } catch (err) {
               console.error('an error occurred while creating instance', err)
           }
           
       }
       return this.instance;
   }
}

async function sendMessage(connector, topicName, message) {
    try {
        await connector.produce(topicName, null, Buffer.from(message), null, null, null, null, null)
    } catch(error) {
         console.error(`An error occurred while sendMessage ${error.message}`)
    }
}

async function disconnect(connector) {
    await connector.disconnect();
}
module.exports = { KafkaConnector, sendMessage, disconnect };