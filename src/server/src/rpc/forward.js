'use strict'

const debug = require('debug')
const log = debug('peertunnel:rpc:forward')

const RPC = require('../../../common/rpc')
const {ForwardRequest, ForwardResponse, ETABLE} = require('../../../common/proto')

module.exports = RPC(ForwardResponse, ForwardRequest, async (rpc, tunnel, remote) => {
  log('requesting tunnel %s', tunnel.address)
  await rpc.write({tunnel, remote})

  const resp = await rpc.read()
  if (resp.error) { throw new Error('Client returned error: ' + ETABLE[resp.error]) }

  log('request success %s', tunnel.address)
  return rpc.rest()
})
