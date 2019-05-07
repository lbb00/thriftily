const eggThriftily = require('./src/eggThriftily')

module.exports = app => {
  if (app.config.thriftily.app) eggThriftily(app)
}
