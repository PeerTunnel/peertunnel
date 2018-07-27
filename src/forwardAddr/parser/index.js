'use strict'

const tokenizer = require('./tokenizer')
const astifier = require('./astifier')
const compiler = require('./compiler')

/*

Example:

/tcp/.port/5323/ssl/.hostname/*.example.com/http/.path/"/myservice"/_ws/stream/

[
  {protocol: 'tcp', conditions: {port: {compare: 'strict', value: 5323}, action: 'stream'},
  {protocol: 'ssl', conditions: {hostname: {compare: 'glob', value: '*.example.com'}}, action: 'stream'},
  {protocol: 'http', conditions: {path: {compare: 'strict', value: '/myservice'}}, action: 'sub', sub: {
    protocol: 'ws', conditions: {}, action: 'stream'
  }},
]

*/

module.exports = function parser (str) {
  return compiler(astifier(tokenizer(str)))
}
