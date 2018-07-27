'use strict'

const tokenizer = require('./tokenizer')
const astifier = require('./astifier')
const compiler = require('./compiler')

module.exports = function parser (str) {
  return compiler(astifier(tokenizer(str)))
}
