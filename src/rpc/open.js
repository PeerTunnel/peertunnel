'use strict'

const handshake = require('pull-handshake')
const RPC = require('../common/rpc')
const {OpenRequest, OpenResponse, ETABLE} = require('../common/proto')

module.exports = function OpenRPC (suffix, handler, tunnels, cb) {
  const shake = handshake()

  const rpc = RPC(shake.handshake, OpenResponse, OpenRequest)

  const _ = async () => {
    try {
      await rpc.write({suffix})
      const result = await rpc.read()

      if (result.error) { return cb(new Error('Server returned error: ' + ETABLE[result.error])) }
      result.tunnel.handler = handler
      tunnels.store[result.tunnel.forwardSecret] = result.tunnel

      cb()
    } catch (e) {
      return cb(e)
    }
  }
  _()

  return shake
}
