'use strict'

module.exports = {
  properties: {
    version: {
      type: 'string'
    }
  },
  detect: async (conn) => {
    let version = String(await conn.read(4))

    if (version !== 'SSH-2') {
      return false
    }

    let next
    while ((next = String(await conn.read(1)) !== '\n') { // TODO: add reading limit
      version += next
    }

    return {version}
  }
}
