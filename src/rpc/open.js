'use strict'

const debug = require('debug')
const log = debug('peertunnel:rpc:open')

const RPC = require('../common/rpc')
const {OpenRequest, OpenResponse, ETABLE} = require('../common/proto')
const pull = require('pull-stream')

module.exports = RPC(OpenResponse, OpenRequest, async (rpc, suffix, handler, tunnels, onClose) => {
  log('sending open for suffix=%s', suffix)
  await rpc.write({suffix})
  const result = await rpc.read()

  if (result.error) { throw new Error('Server returned error: ' + ETABLE[result.error]) }

  result.tunnel.handler = handler
  tunnels.store[result.tunnel.forwardSecret] = result.tunnel // TODO: enforce some things about the secret (length, entropy)

  log('got tunnel %s', result.tunnel.address)

  const conn = rpc.rest()

  pull(
    (end, cb) => {},
    conn,
    pull.onEnd((err) => {
      log('tunnel %s closed', result.tunnel.address, err)
      delete tunnels.store[result.tunnel.forwardSecret]
      onClose(err)
    })
  )

  return result.tunnel
})
