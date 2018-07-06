'use strict'

const debug = require('debug')
const log = debug('peertunnel:rpc:open')

const RPC = require('../../../common/rpc')
const {OpenRequest, OpenResponse, Error} = require('../../../common/proto')
const crypto = require('crypto')
const pull = require('pull-stream')

const ALLOWED_RE = /^[a-z0-9]+$/
const MAX_LEN = 16

module.exports = RPC(OpenRequest, OpenResponse, async (rpc, pi, main) => {
  const request = await rpc.read()

  let user
  try {
    user = await main.storage.getUser(pi.id.toB58String())
    if (!user.username) { throw new Error() /* TODO: storable never throws (at least for now - should do later), if username is missing it has created an empty stub */ }
  } catch (e) {
    return rpc.write({error: Error.NOT_AUTHORIZED})
  }

  const { suffix } = request

  log('got open (from=%s, suffix=%s)', pi.id.toB58String(), suffix)

  let address = user.username

  if (suffix) {
    if (!suffix.match(ALLOWED_RE) || suffix.length > MAX_LEN) {
      return rpc.write({error: Error.MALFORMED})
    }

    address = suffix + '-' + address
  }

  let secret = crypto.randomBytes(16).toString('hex') // forward secret

  let online = true

  const tunnel = main.tunnels.createTunnel(address, pi, secret, () => online)

  await rpc.write({tunnel})

  const conn = rpc.rest()

  pull(
    (end, cb) => {},
    conn,
    pull.onEnd(() => (online = false))
  )
})
