const sql = require('mssql')
const path = require("path");
const fs = require("fs");

const { config } = require('../config')


const connection = () => {
    return new Promise((resolve, reject) => {
        const { hosts, username, password, database, options } = config.mssql
            const sqlConfig = {
                server: hosts,
                user: username,
                password,
                database,
                options
            }
            sql.connect(sqlConfig).then((pool) => {
                resolve(pool)
            }).catch((err) => {
                reject(err)
            })
    })
}

class MSSqlDbConnector {
    conn = null

    constructor(conn) {
        this.conn = conn
    }

    async doOperation(query) {
        return await this.conn.query(query)
    }

    async insertDataIntoPedidoTable(scoobyId, originOrderId) {
        return await this.conn.query(`INSERT INTO TestDb.dbo.Pedidos (Id, CanceladoEm, ClienteId, IpCliente, Codigo, CriadoEm, Entrega_Endereco_CEP, Entrega_Endereco_Cidade, Entrega_Endereco_Complemento, Entrega_Endereco_Bairro, Entrega_Endereco_Nome, Entrega_Endereco_Numero, Entrega_Endereco_NomeDeQuemIraReceber, Entrega_Endereco_UF, Entrega_Endereco_Logradouro, Entrega_Endereco_TelefoneFixo_DDD, Entrega_Endereco_TelefoneFixo_Numero, Entrega_FreteTotal, Desconto, DiferencaValorDesconto, VigenciaVendaInicio, VigenciaVendaTermino, PrimeiraCompra, GEREST_Ref, PedidoIdPlataformaIhub, OrigemId, Pagamento_CodigoEspecie, Pagamento_MesCartao, Pagamento_NumeroDeParcelas, Pagamento_PagoEm, Pagamento_Boleto, Pagamento_UrlBoleto, Pagamento_AnoCartao, Preco_UsarSite, EstagioPedido, CanalVendaId, StatusId, SubTotal, Total, TotalInsumosGratis, AtualizadoEm, Peso)
            VALUES(${scoobyId}, '', 0, '', 'b319055e-f125-4be4-b21e-dd706260bcb7', '', '', '', '', '', '', '', '', '', '', '', '', 0, 0, 0, '', '', 0, 0, '${originOrderId}', 0, '', 0, 0, '', 0, '', 0, 0, 0, 0, 0, 0, 0, 0, '', 0);`)
    }

    async deleteAll() {
        await this.doOperation('truncate table TrackingHistorico')
        await this.doOperation('truncate table Pedidos_Itens_Tracking')
        await this.doOperation('truncate table Pedidos_Itens')
        await this.doOperation('truncate table Pedidos_GruposEntrega')
        await this.doOperation('truncate table Pedidos_Cancelamentos_Itens')
        await this.doOperation('truncate table Pedidos_Cancelamentos')
        await this.doOperation('truncate table Pedidos')
        return
    }

    async disconnect() {
        await this.conn.close()
    }
}

class MSSqlDBConnectorInstance {
    instance = null

    static async getInstance() {
        if (!this.instance) {
            const conn = await connection()
            this.instance = new MSSqlDbConnector(conn)
        }

        return this.instance
    }
}

module.exports = { MSSqlDBConnectorInstance }