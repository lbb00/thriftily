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
    let _client = client
    if (this.async) {
      _client = new Proxy(client, {
        get (target, propKey) {
          return (...params) => {
            if (params.length > 0 && typeof params[params.length - 1] === 'function') {
              // Had a callback function in params
              target[propKey](...params)
            } else {
              // Promise
              return new Promise((resolve, reject) => {
                target[propKey](...params, (err, res) => {
                  if (err) {
                    reject(err)
                  } else {
                    resolve(res)
                  }
                })
              })
            }
          }
        }
      })
    }
    this.client = _client
    return _client
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
