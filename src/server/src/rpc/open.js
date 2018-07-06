'use strict'

const handshake = require('pull-handshake')
const RPC = require('../../../common/rpc')
const {OpenRequest, OpenResponse, Error} = require('../../../common/proto')
const crypto = require('crypto')
const pull = require('pull-stream')

const ALLOWED_RE = /^[a-z0-9]$/
const MAX_LEN = 16

module.exports = function OpenRPC (pi, main) {
  const shake = handshake()

  const rpc = RPC(shake.handshake, OpenRequest, OpenResponse)

  const _ = async () => { // TODO: find a better way to wrap this (maybe create a function that also creates the RPC?)
    const request = await rpc.read()

    let user
    try {
      user = await main.storage.getUser(pi.id.toB58String())
    } catch (e) {
      return rpc.write({error: Error.NOT_AUTHORIZED})
    }

    let { suffix } = request

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

    const conn = shake.handshake.rest()

    pull(
      (end, cb) => {},
      conn,
      pull.onEnd(() => (online = false))
    )
  }
  _()

  return shake
}
