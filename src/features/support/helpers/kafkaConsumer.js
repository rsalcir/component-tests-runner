const Kafka = require('node-rdkafka');
const { config } = require('../config')

const kafkaConfig = {
    'metadata.broker.list': config.kafka.hosts,
    'group.id': config.kafka.consumers.group,
    'enable.auto.commit': false,
    'sasl.mechanism': 'PLAIN',
    'sasl.mechanisms': 'PLAIN',
    'security.protocol': 'SASL_PLAINTEXT',
    'sasl.username': config.kafka.username,
    'sasl.password': config.kafka.password,
}

const createConsumer = () => {
    return new Promise((resolve, reject) => {
        try {
            const consumer = new Kafka.KafkaConsumer(kafkaConfig);
            consumer.connect()
            consumer.on('ready', () => {
                const topics = []
                for (let consumer of config.kafka.consumers) {
                    topics.push(consumer.topic)
                }
                consumer.subscribe(topics)
                consumer.consume()
                resolve(consumer)
            })
        } catch (error) {
            reject(error)
        }
    })
}

class KafkaConsumer {
    mapOfMessages = new Map()
    consumer = null

    constructor() {}

    async setConsumer() {
        this.consumer = await createConsumer()
        this.consumer.on('data', (message) => {
            const key = message.topic
            const body = message.value.toString()
            let listOfMessages = this.mapOfMessages.get(key)
            if (listOfMessages === undefined) {
                listOfMessages = []
            }
            listOfMessages.push(body)
            this.mapOfMessages.set(key, listOfMessages)
            this.consumer.commit()
        })
    }

    checkMessages(topic) {
        let listOfMessages = this.mapOfMessages.get(topic)
        if (listOfMessages === undefined) {
            listOfMessages = []
        }
        return listOfMessages
    }

    getConsumer() {
        return this.consumer
    }

    cleanMessages() {
        this.mapOfMessages.clear()
    }
}


class KafkaConsumerConnector {
    instance = null;
    static async getInstance() {
        if (!this.instance) {
            this.instance = new KafkaConsumer()
            await this.instance.setConsumer()
        }
        return this.instance
    }
}

module.exports = { KafkaConsumerConnector }