'use strict'

function compiler (ast) {
  function parseProto (p) {
    let out = {protocol: p.protocol, conditions: {}}
    p.body.filter(branch => branch.type === 'condition').forEach(condition => {
      out.conditions[condition.name] = {compare: condition.matcher, value: condition.value}
    })
    let sub = p.body.filter(branch => branch.type === 'protocol')[0]
    let action = p.body.filter(branch => branch.type === 'action')[0]

    if (sub) {
      if (action) {
        throw new Error('Subproto and action specified! This is invalid!')
      }
      out.action = 'sub'
      out.sub = parseProto(sub)
    } else {
      if (action) {
        out.action = action.name
      }
    }

    return out
  }

  return ast.map((proto, i) => {
    proto = parseProto(proto)

    if (!proto.action) {
      proto.action = ast.length - 1 === i ? 'forward' : 'stream'
    }

    return proto
  })
}

module.exports = compiler
