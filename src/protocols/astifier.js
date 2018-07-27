'use strict'

function astifier (tokens) {
  let current = 0

  let cur = () => tokens[current]
  let next = () => current++

  let out = []

  function walk () {
    switch (cur().type) {
      case 'subproto':
      case 'proto': {
        let p = {type: 'protocol', protocol: cur().name, body: []}
        next()
        while (cur() && cur().type !== 'protocol') {
          p.body.push(walk())
          next()
        }
        return p
      }
      case 'action': case 'condition': {
        return cur()
      }
      default: throw new TypeError(cur().type)
    }
  }

  while (current < tokens.length) {
    out.push(walk())
  }

  return out
}

module.exports = astifier
