const thrift = require('thrift')
const EventEmitter = require('events')

class Thriftily extends EventEmitter {
  constructor (alias, clientConfig, logger) {
    super()
    this.config = clientConfig
    this.alias = alias
    this.logger = logger
    this.attemptCount = 0

    // ping
    this.pingTimer = null
    if (this.config.ping) {
      const args = this.config.ping.slice(1)
      const pingName = this.config.ping[0]
      this.ping = function _ping () {
        return this.client[pingName](...args)
      }
    }

    // start
    this.createConnection()
    this.createClient()
  }

  reConnect () {
    // close connection
    this.connection.end()

    this.attemptCount++
    this.createConnection()
    this.createClient()
  }

  createConnection () {
    const {
      host,
      port,
      transport = thrift.TFramedTransport,
      protocol = thrift.TBinaryProtocol,
      ...otherOptions
    } = this.config
    const connection = thrift.createConnection(host, port, {
      transport,
      protocol,
      ...otherOptions
    })
    this.connection = connection
    connection.on('connect', e => {
      // reset
      this.attemptCount = 0
      this.emit('connect', e)
    })
    connection.on('close', e => this.emit('close', e))
    connection.on('error', e => {
      // reset
      if (this.pingTimer) clearTimeout(this.pingTimer)
      this.emit('error', e)
    })
    connection.on('timeout', e => this.emit('timeout', e))
    return connection
  }

  createClient () {
    const client = thrift.createClient(this.config.client, this.connection)
    this.client = client
    return client
  }

  async doPing () {
    if (!this.ping) return
    try {
      const res = await this.ping()
      this.logger && this.logger.debug(`[egg-thriftily ${this.alias}] ping:`, res)
      this.pingTimer = setTimeout(this.doPing.bind(this), this.config.pingAttemptTime || 10000)
    } catch (e) {
      this.emit('error', new Error(`ping error: ${e.message}`))
    }
  }
}

module.exports = Thriftily
