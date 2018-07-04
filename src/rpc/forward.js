'use strict'

const handshake = require('pull-handshake')
const RPC = require('../common/rpc')
const {ForwardRequest, ForwardResponse, Error} = require('../common/proto')

module.exports = function ForwardRPC (tunnels) {
  const shake = handshake()

  const rpc = RPC(shake.handshake, ForwardRequest, ForwardResponse)
  rpc.read((data) => {
    const tunnel = tunnels.store[data.tunnel.forwardSecret]
    const remote = data.remote

    if (!tunnel || tunnel.address !== data.tunnel.address) {
      return rpc.write({error: Error.TUNNEL_MISSING})
    }

    rpc.write({}, (err) => {
      if (!err) {
        return tunnel.handler(shake.rest(), remote)
      }
    })
  })

  return shake
}
