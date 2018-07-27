'use strict'

const tokenizer = require('./tokenizer')
const astifier = require('./astifier')

function parser (str) {
  const tree = astifier(tokenizer(str))
}
