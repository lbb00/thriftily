function log (type, args, fn) {
  return fn(new Date().toLocaleString(), type, ...args)
}
const logger = {
  info (...args) {
    log('INFO', args, console.log)
  },
  debug (...args) {
    log('DEBUG', args, console.log)
  },
  warn (...args) {
    log('WARN', args, console.warn)
  },
  error (...args) {
    log('ERROR', args, console.error)
  }
}

module.exports = logger
