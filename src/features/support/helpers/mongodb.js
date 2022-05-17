const { MongoClient } = require('mongodb')
const { config } = require('../config')

const connection = () => {
    return new Promise((resolve, reject) => {
        const { hosts, username, password } = config.mongodb
            try {
                const client =  new MongoClient(`mongodb://${username}:${password}@${hosts}`)
                client.connect().then(() => {
                    resolve(client)
                })

            } catch (error) {
                reject(error)
            }
    })
}

class MongoDbConnector {
    client = null
    database = null

    constructor(client, database) {
        this.client = client
        this.database = database
    }

    async getDocuments(collection, query = {}) {
        const doc = this.database.collection(collection)
        return await doc.find(query).toArray()
    }

    async deleteAllDocuments(collection) {
        const doc = await this.database.collection(collection)
        await doc.deleteMany({})
    }

    async createDocument(collection, content) {
        const doc = await this.database.collection(collection)
        await doc.insertOne(content)
    }

    async disconnect() {
        await this.client.close()
    }
}

class MongoDbConnectorInstance {
    instance = null 

    static async getInstance() {
        if(!this.instance) {
            const client = await connection()
            const database = client.db(config.mongodb.database)
            this.instance = new MongoDbConnector(client, database)
        }

        return this.instance;
    }
}

module.exports = { MongoDbConnector, MongoDbConnectorInstance };




