'use strict'

const debug = require('debug')
const log = debug('peertunnel:rpc:open')

const RPC = require('../../../common/rpc')
const {OpenRequest, OpenResponse, Error} = require('../../../common/proto')
const crypto = require('crypto')
const pull = require('pull-stream')

module.exports = RPC(OpenRequest, OpenResponse, async (rpc, pi, main) => {
  // const request = await rpc.read()

  let user
  try {
    user = await main.storage.getUser(pi.id.toB58String())
    if (!user.username) { throw new Error() /* TODO: storable never throws (at least for now - should do later), if username is missing it has created an empty stub */ }
  } catch (e) {
    return rpc.write({error: Error.NOT_AUTHORIZED})
  }

  log('got open (from=%s)', pi.id.toB58String())

  let secret = crypto.randomBytes(16).toString('hex') // forward secret

  let online = true

  const tunnel = main.tunnels.createTunnel(user.username, pi, secret, () => online)

  await rpc.write({tunnel})

  const conn = rpc.rest()

  pull(
    (end, cb) => {},
    conn,
    pull.onEnd(() => {
      online = false
      main.tunnels.gc()
    })
  )
})
