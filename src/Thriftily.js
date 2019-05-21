const thrift = require('thrift')
const EventEmitter = require('events')

class Thriftily extends EventEmitter {
  constructor (alias, clientConfig, async) {
    super()
    this.config = clientConfig
    this.alias = alias
    this.async = async
    this.attemptCount = 0

    // ping
    if (this.config.ping) {
      if (typeof this.config.ping === 'function') {
        this.ping = this.config.ping
      } else {
        this.ping = this.client[this.config.ping]
      }
    }

    // start
    this.createConnection()
    this.createClient()
  }

  reConnect () {
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
      this.attemptCount = 0 // rest
      this.emit('connect', e)
    })
    connection.on('close', e => this.emit('close', e))
    connection.on('error', e => this.emit('error', e))
    connection.on('timeout', e => this.emit('timeout', e))
    return connection
  }

  createClient () {
    const client = thrift.createClient(this.config.client, this.connection)
    this.client = client
    return client
  }

  doPing () {
    if (!this.ping) return
    this.ping(function pingCallback (err) {
      if (!err) {
        setTimeout(1000, this.doPing)
      }
    })
  }
}

module.exports = Thriftily
