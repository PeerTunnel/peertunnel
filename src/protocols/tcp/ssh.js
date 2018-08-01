'use strict'

module.exports = {
  properties: {
    version: {
      type: 'string',
      match: 'strict'
    }
  },
  detect: async (conn) => {
    let version = String(await conn.read(7))

    if (version !== 'SSH-2.0') {
      return false
    }

    let next
    while ((next = String(await conn.read(1)) !== '\n')) { // TODO: add reading limit
      version += next
    }

    return {version}
  }
}
