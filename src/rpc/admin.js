'use strict'

const RPC = require('../common/rpc')
const {AdminRequest, AdminResponse, ETABLE} = require('../common/proto')

module.exports = RPC(AdminResponse, AdminRequest, async (rpc, req) => {
  await rpc.write(req)
  const res = await rpc.read()
  if (res.error) { throw new Error('Admin RPC Error: ' + ETABLE[res.error]) }
})
