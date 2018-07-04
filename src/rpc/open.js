'use strict'

const handshake = require('pull-handshake')
const RPC = require('../common/rpc')
const {OpenRequest, OpenResponse, ETABLE} = require('../common/proto')

module.exports = function OpenRPC (suffix, handler, tunnels, cb) {
  const shake = handshake().handshake

  const rpc = RPC(shake.handshake, OpenResponse, OpenRequest)
  rpc.write({suffix}, (err) => {
    if (err) { return cb(err) }
    rpc.read((result) => {
      if (result.error) { return cb(new Error('Server returned error: ' + ETABLE[result.error])) }
      result.tunnel.handler = handler
      tunnels.store[result.tunnel.forwardSecret] = result.tunnel

      return cb()
    })
  })

  return shake
}
