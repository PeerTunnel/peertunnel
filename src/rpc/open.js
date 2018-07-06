'use strict'

const debug = require('debug')
const log = debug('peertunnel:rpc:open')

const RPC = require('../common/rpc')
const {OpenRequest, OpenResponse, ETABLE} = require('../common/proto')

module.exports = RPC(OpenResponse, OpenRequest, async (rpc, suffix, handler, tunnels) => {
  log('sending open for suffix=%s', suffix)
  await rpc.write({suffix})
  const result = await rpc.read()

  if (result.error) { throw new Error('Server returned error: ' + ETABLE[result.error]) }

  result.tunnel.handler = handler
  tunnels.store[result.tunnel.forwardSecret] = result.tunnel

  log('got tunnel %s', result.tunnel.address)

  rpc.rest() // prevent stream from getting GC'd
})
