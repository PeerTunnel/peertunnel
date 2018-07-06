'use strict'

const handshake = require('pull-handshake')
const RPC = require('../../../common/rpc')
const {ForwardRequest, ForwardResponse, ETABLE} = require('../../../common/proto')

module.exports = function ForwardRPC (tunnel, remote, cb) {
  const shake = handshake()

  const rpc = RPC(shake.handshake, ForwardResponse, ForwardRequest)

  const _ = async () => {
    console.log('do req')
    try {
      await rpc.write(tunnel)
      const resp = await rpc.read()
      if (resp.error) { return cb(new Error('Client returned error: ' + ETABLE[resp.error])) }
      return cb(null, shake.rest())
    } catch (e) {
      return cb(e)
    }
  }
  _()

  return shake
}
