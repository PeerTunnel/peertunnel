'use strict'

const handshake = require('pull-handshake')
const RPC = require('../../../common/rpc')
const {ForwardRequest, ForwardResponse, ETABLE} = require('../../../common/proto')

module.exports = function ForwardRPC (tunnel, remote, cb) {
  const shake = handshake()

  const rpc = RPC(shake.handshake, ForwardResponse, ForwardRequest)
  rpc.write(tunnel, (err) => {
    if (err) { return cb(err) }
    rpc.read(async (resp) => {
      if (resp.error) { return cb(new Error('Client returned error: ' + ETABLE[resp.error])) }
      return cb(null, shake.rest())
    })
  })

  return shake
}
