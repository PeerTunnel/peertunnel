'use strict'

const debug = require('debug')
const log = debug('peertunnel:rpc:forward')

const RPC = require('../common/rpc')
const {ForwardRequest, ForwardResponse, Error} = require('../common/proto')

module.exports = RPC(ForwardRequest, ForwardResponse, async (rpc, tunnels) => {
  const data = await rpc.read()
  log('forward for %s', data.tunnel.address)

  const tunnel = tunnels[data.tunnel.forwardSecret]
  const remote = data.remote

  if (!tunnel || tunnel.address !== data.tunnel.address) {
    return rpc.write({error: Error.TUNNEL_MISSING})
  }

  await rpc.write({}) // send OK
  return tunnel.handler(rpc.rest(), remote)
})
