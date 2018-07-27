'use strict'

/* eslint-disable complexity */

const LETTER = /[a-z]/
const ACTIONS = ['forward', 'stream']

function tokenizer (input) {
  let current = 0
  let tokens = []

  let type = 'main'

  let cur = () => input[current] || ''
  let next = () => current++
  let unexpected = (ex) => {
    let err = new SyntaxError('Unexpected token ' + cur() + ' @ ' + current + (ex ? ' expected ' + ex : ''))
    err.stack = input + '\n' + ' '.repeat(current) + '^' + '\n\n' + err.stack
    throw err
  }

  while (current < input.length) {
    switch (type) {
      case 'main':
        if (cur() !== '/') {
          unexpected('/')
        }
        next()
        type = 'token' // goto :token
        break
      case 'token':
        if (cur().match(LETTER)) {
          type = 'proto'
        } else if (cur() === '.') {
          type = 'condition'
          next()
        } else if (cur() === '_') {
          type = 'subproto'
          next()
        } else {
          unexpected('a protocol, subprotocol or condition')
        }
        break
      case 'proto': {
        let name = ''
        while (cur().match(LETTER)) {
          name += cur()
          next()
        }
        if (ACTIONS.indexOf(name) !== -1) {
          tokens.push({type: 'action', name})
        } else {
          tokens.push({type: 'proto', name})
        }
        type = 'main'
        break
      }
      case 'subproto': {
        let name = ''
        while (cur().match(LETTER)) {
          name += cur()
          next()
        }
        tokens.push({type: 'subproto', name})
        type = 'main'
        break
      }
      case 'condition': {
        let name = ''
        let value = ''
        while (cur().match(LETTER)) {
          name += cur()
          next()
        }
        if (cur() !== '/') {
          unexpected('/')
        }
        next()
        while (cur().match(/[^/]/)) { // TODO: support escaping with quotes
          value += cur()
          next()
        }
        tokens.push({type: 'condition', name, value})
        type = 'main'
        break
      }
      default: throw new Error('Parser Error')
    }
  }

  return tokens
}

module.exports = tokenizer
