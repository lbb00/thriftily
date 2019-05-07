# Thriftily

A plugin for create thrift client.

Support: Node Eggjs

## Useage

### Config

#### Common Config
```javascript
const thriftilyConfig = {
  app: true, // default true, use it with eggjs
  agent: false, // default flase, use it with eggjs
  async: false, // default false, use promise
  reconnect: true, // default true
  maxAttempts: 0, // default 0
  attemptTime: 2000, // default 2000ms
  default: {},
  clients: {}
 
}

// default
const default = { // it will merge with all clients
  host: '1.2.3.4'
}

// clients example
cosnt clients = {
  userServer:{ // 'userServer' as client name
    host: ''.
    port: ''
  }
}
```

#### Egg Config

```javascript
moduel.exports.thriftily = // same as upper
```

### Node

```javascript
const { ThriftilyManage } = require("thriftily");
const thriftilyConfig = require("your config");

const manage = new ThriftilyManage(yourConfig, yourLogger);
manage.start(); // will connect all client

const { client } = manage.thriftilyMap.get("your client name");
```


### Egg

```
const { Service } = require('egg');

class FooService extends Service {
  bar() {
    const { client } = this.app.thriftily.get('your client name');

    client.anyMethod(null, (err, data) => {

    });
    // thriftilyConfig is true
    try{
      const res = await client.anyMethod(null)
    }catch(e){

    }
  }
}
```