# CHANGELOG

## v1.0.2(2019.6.11 GMT+0800)

### fix

1. Eggjs logger must use `this.logger.info` way.

## v1.0.1 (2019.6.11 GMT+0800)

### feature

1. Add pinglog configuration.

## v1.0.0 (2019.6.6 GMT+0800)

### feature

1. Refactor code.
2. New configuration.

### fix

1. Can’t get client correctly by thriftilyManger.get('alias').

## v0.2.1 (2019.5.21 GMT+0800)

### feature

1. Remove config.async, the reason is because [THRIFT-2376: nodejs: allow Promise style calls for client and server](https://issues.apache.org/jira/browse/THRIFT-2376).
2. Support ping and can config ping method in config.js.
3. Support get client by thriftilyManger.get('alias name').

## v0.1.1 (2019.5.8 GMT+0800)

### feature

1. Modify README.md .

### fix

1. Remove egg dependencies thrift.

## v0.1.0 (2019.5.8 GMT+0800)

### feature

1. First publish.
