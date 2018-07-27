'use strict'

module.exports = {
  properties: {
    hostname: {
      type: 'hostname'
    },
    version: {
      type: 'string'
    }
  },
  detect: async (conn) => {
    // TODO: parse handshake packet
  },
  stream: async (conn) => {

  }
}
