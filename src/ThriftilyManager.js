const Thriftily = require('./Thriftily')
const configDefault = require('../config/config.default').thriftily

class ThriftilyManager {
  constructor (config, logger) {
    this.logger = logger
    this.config = { ...configDefault, ...config }
    this.thriftilyMap = new Map()
  }

  start () {
    Object.keys(this.config.clients).forEach(alias => this.createThriftily(alias, this.config.clients[alias]))
  }

  createThriftily (alias, clientConfig) {
    if (this.thriftilyMap.has(alias)) {
      return this.thriftilyMap.get(alias)
    }
    const thriftily = new Thriftily(
      alias,
      {
        ...this.config.default,
        ...clientConfig
      },
      this.logger
    )
    this.thriftilyMap.set(alias, thriftily)

    thriftily.on('connect', e => {
      this.logger && this.logger.info(`[egg-thriftily ${alias}] 微服务已连接`)
      thriftily.doPing()
    })

    thriftily.on('error', e => {
      this.logger && this.logger.error(`[egg-thriftily ${alias}] 微服务连接错误`, e)
    })

    thriftily.on('timeout', e => {
      this.logger && this.logger.warn(`[egg-thriftily ${alias}] 微服务连接超时`)
    })

    thriftily.on('close', e => {
      if (this.config.maxAttempts !== 0 && thriftily.attemptCount === this.config.maxAttempts) {
        this.logger &&
          this.logger.warn(`[egg-thriftily ${alias}] 重连超过最大次数(${this.config.maxAttempts}次),已经停止`)
      } else {
        this.logger &&
          this.logger.warn(
            `[egg-thriftily ${alias}] 微服务连接断开，${this.config.attemptTime}ms后尝试重连第${thriftily.attemptCount +
              1}次`
          )
        setTimeout(() => {
          thriftily.reConnect()
        }, this.config.attemptTime)
      }
    })
    return thriftily
  }
}

module.exports = ThriftilyManager
