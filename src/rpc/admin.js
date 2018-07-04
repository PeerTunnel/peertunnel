'use strict'

const handshake = require('pull-handshake')
const RPC = require('../common/rpc')
const {AdminRequest, AdminResponse, ETABLE} = require('../common/proto')

module.exports = function AdminRPC (req, cb) {
  const shake = handshake()

  const rpc = RPC(shake.handshake, AdminResponse, AdminRequest)
  rpc.write(req, (err) => {
    if (err) { return cb(err) }
    rpc.read(async (err, res) => {
      if (err) { return cb(err) }
      if (res.error) { return cb(new Error('Admin RPC Error: ' + ETABLE[res.error])) }
      return cb()
    })
  })

  return shake
}
