const ThriftilyManager = require('./ThriftilyManager')

// for egg.js
module.exports = app => {
  app.addSingleton('thriftily', createThriftily)
}

function createThriftily (config, app) {
  const manager = new ThriftilyManager(app.config.thriftily, app.logger)
  const client = manager.createThriftily(config.host, config)
  return client
}
