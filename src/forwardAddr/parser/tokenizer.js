'use strict'

/* eslint-disable complexity */

const LETTER = /[a-z]/
const ACTIONS = ['forward', 'stream']

/*

Explanation in pseudo-grammar:

:main
next /
goto :token

:token
if next [a-z]
  goto :main
elif next .
  goto :condition
elif next _
  goto :subproto

:proto
next [a-z0-9] $proto
token protocol $proto
next /
goto :token

:condition
next [^/] $cond
next /
next [^/] $value
token condition $cond $value
next /
goto :token

:subproto
next [a-z0-9] $subproto
token subprotocol $subproto
next /
goto :token

*/

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

        let parseValue = true
        let inQuotes = false
        if (cur() === '"') {
          inQuotes = true
          next()
        }

        while (parseValue) {
          if (cur() === '\\' && input[current + 1] === (inQuotes ? '"' : '/')) {
            // do nothing...
            next()
          } else if (cur() === (inQuotes ? '"' : '/')) {
            parseValue = false
          } else {
            value += cur()
          }
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
