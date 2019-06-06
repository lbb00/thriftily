# Thriftily

A plugin for use thrift clients quickly and friendly with nodejs or eggjs.

Support: Node 10+,Eggjs

[![Npm Version](https://img.shields.io/npm/v/thriftily.svg?style=flat-square)](https://www.npmjs.com/package/thriftily)
[![License](https://img.shields.io/github/license/loveonelong/thriftily.svg?style=flat-square)](https://img.shields.io/github/license/loveonelong/thriftily.svg)
[![Npm Download](https://img.shields.io/npm/dm/thriftily.svg?style=flat-square)](https://www.npmjs.com/package/thriftily)

## Useage

```bash
npm install thriftily -save
```

### Common Config

```javascript
const config = {
  app: true, // default true, use it with eggjs app
  agent: false, // default flase, use it with eggjs agent
  default: {
    // it will as default as all clients config
    reconnect: true, // default true
    reconnectMaxTimes: 200, // default 0, 0 means no limit
    reconnectMaxSleep: 30000, // default 60000ms, reconnect sleep equals reconnect times multiplication 1000ms.
    host: '1.2.3.4',
    pingSleep: 5000 // default 10000ms
  },
  clients: {
    // clients config example, msFoo & msBar as alias name
    msFoo:{
      host: 'foohost',
      port: 'fooport',
      client: yourFooGenjs
      ping: 'youpingName',  // your ping method name in yourFooGenjs
      pingSleep: 5000
    },
    msBar:{
      host: 'barhost',
      port: 'barport',
      client: yourBarGenjs
    }
  }
}
```

### With Egg

#### config/plugin.js

```javascript
module.exports.thriftily = {
  enable: true,
  package: 'thriftily'
}
```

#### config/config.js

```javascript
module.exports.thriftily = thriftilyConfig // same as upper common config
```

#### Use in service

```javascript
const { Service } = require('egg')

class FooService extends Service {
  bar() {
    const { app } = this
    const { client } = app.thriftily.get('your client name')
    try{
      const res = await client.yourClientMethod()
    }catch(e){
      console.log(e)
    }
  }
}
```

### With Node

```javascript
const { ThriftilyManager } = require('thriftily')
const thriftilyConfig = require('your config path')

const manager = new ThriftilyManager(yourConfig, yourLogger)
manager.start()

const { client } = manager.get('your client alias')

try {
  const res = await client.yourClientMethod()
} catch (e) {
  console.log(e)
}
```
