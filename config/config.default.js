const config = {
  thriftily: {
    app: true,
    agent: false,
    clients: {},
    default: {
      reconnect: true,
      reconnectMaxTimes: 0,
      reconnectMaxSleep: 60000,
      pingSleep: 10000
    }
  }
}

module.exports = config
