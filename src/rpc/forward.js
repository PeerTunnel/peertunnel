'use strict'

const debug = require('debug')
const log = debug('peertunnel:rpc:forward')

const RPC = require('../common/rpc')
const {ForwardRequest, ForwardResponse, Error} = require('../common/proto')
const pull = require('pull-stream')

module.exports = RPC(ForwardRequest, ForwardResponse, async (rpc, tunnels) => {
  const data = await rpc.read()
  log('forward for %s', data.tunnel.address)

  const tunnel = tunnels[data.tunnel.forwardSecret]
  const remote = data.remote

  if (!tunnel || tunnel.address !== data.tunnel.address) {
    return rpc.write({error: Error.TUNNEL_MISSING})
  }

  let conn

  try {
    conn = await tunnel.handler(remote)
  } catch (e) {
    await rpc.write({error: e.code || Error.OTHER})
    return
  }

  await rpc.write({})
  pull(conn, rpc.rest(), conn)
})
