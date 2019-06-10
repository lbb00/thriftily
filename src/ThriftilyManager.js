const Thriftily = require('./Thriftily')
const configDefault = require('../config/config.default').thriftily
const localLogger = require('./logger')
class ThriftilyManager {
  constructor (config, logger = localLogger) {
    this.logger = logger
    this.config = Object.assign({}, configDefault, config, {
      default: Object.assign({}, configDefault.default, config.default)
    })
    this.thriftilyMap = new Map()
  }

  start () {
    Object.keys(this.config.clients).forEach(alias => this.createThriftily(alias, this.config.clients[alias]))
  }

  createThriftily (alias, clientConfig) {
    if (this.thriftilyMap.has(alias)) return this.thriftilyMap.get(alias)
    const thriftilyConfig = Object.assign({}, this.config.default, clientConfig)
    const thriftily = new Thriftily(alias, thriftilyConfig)
    this.thriftilyMap.set(alias, thriftily)

    const genTag = () => `[Thriftily ${alias}]`

    let pingTimeout = null
    const ping = thriftilyConfig.ping
      ? () => thriftily.client[thriftilyConfig.ping[0]](...thriftilyConfig.ping.slice(1))
      : null
    const doPing = async () => {
      if (!ping) return
      const startDate = new Date().valueOf()
      try {
        await ping()
        const printPinglog = this.config.pinglog ? this.logger.info : this.logger.debug
        printPinglog(`${genTag()} ping ok: time ${new Date().valueOf() - startDate}ms.`)
        pingTimeout = setTimeout(doPing, thriftilyConfig.pingSleep)
      } catch (e) {
        thriftily.emit('error', new Error(`ping error: time ${new Date().valueOf() - startDate}ms, ${e.message}`))
      }
    }

    let reconnectCount = 0
    const reconnect = () => {
      const { reconnect, reconnectMaxTimes, reconnectMaxSleep } = thriftilyConfig
      if (reconnect) {
        reconnectCount++
        const reconnectSleep = reconnectCount * 1000 >= reconnectMaxSleep ? reconnectMaxSleep : reconnectCount * 1000
        if (reconnectMaxTimes !== 0 && reconnectCount > reconnectMaxTimes) {
          this.logger.warn(
            `${genTag()} Thrift client is stopped. Reconnect exceeds the max times (${reconnectMaxTimes} times).`
          )
          return
        }
        this.logger.info(`${genTag()} Try the ${reconnectCount}rd reconnection after ${reconnectSleep}ms.`)
        setTimeout(() => thriftily.start(), reconnectSleep)
      }
    }

    thriftily.on('connect', async e => {
      this.logger.info(`${genTag()} Thrift client is connected.`)
      reconnectCount = 0
      if (pingTimeout) clearTimeout(pingTimeout)
      doPing()
    })
    thriftily.on('error', e => {
      this.logger.error(`${genTag()} Thrift client error:`, e)
      thriftily.close()
    })
    thriftily.on('timeout', e => {
      this.logger.error(`${genTag()} Thrift client connection timeout.`)
      thriftily.close()
    })
    thriftily.on('close', e => {
      this.logger.info(`${genTag()} Thrift client connection is closed.`)
      reconnect()
    })

    thriftily.start()
    return thriftily
  }

  get (aliasName) {
    return this.thriftilyMap.get(aliasName)
  }
}

module.exports = ThriftilyManager
