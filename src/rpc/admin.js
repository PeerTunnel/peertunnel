'use strict'

const handshake = require('pull-handshake')
const RPC = require('../../../common/rpc')
const {AdminRequest, AdminResponse, ETABLE} = require('../../../common/proto')

module.exports = function AdminRPC (req, cb) {
  const shake = handshake().handshake

  const rpc = RPC(shake.handshake, AdminResponse, AdminRequest)
  rpc.write(req, (err) => {
    if (err) { return cb(err) }
    rpc.read(async (res) => {
      if (res.error) { return cb(new Error('Admin RPC Error: ' + ETABLE[res.error])) }
      return cb()
    })
  })

  return shake
}
