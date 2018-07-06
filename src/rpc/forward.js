'use strict'

const debug = require('debug')
const log = debug('peertunnel:rpc:forward')

const handshake = require('pull-handshake')
const RPC = require('../common/rpc')
const {ForwardRequest, ForwardResponse, Error} = require('../common/proto')

module.exports = function ForwardRPC (tunnels) {
  const shake = handshake()

  const rpc = RPC(shake.handshake, ForwardRequest, ForwardResponse)

  const _ = async () => {
    const data = await rpc.read()
    log('forward for %s', data.tunnel.address)

    const tunnel = tunnels.store[data.tunnel.forwardSecret]
    const remote = data.remote

    if (!tunnel || tunnel.address !== data.tunnel.address) {
      return rpc.write({error: Error.TUNNEL_MISSING})
    }

    await rpc.write()
    return tunnel.handler(shake.rest(), remote)
  }
  _()

  return shake
}
