const eggThriftily = require('./src/eggThriftily')
module.exports = agent => {
  if (agent.config.thriftily.agent) eggThriftily(agent)
}
