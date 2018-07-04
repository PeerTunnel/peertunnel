'use strict'

const handshake = require('pull-handshake')
const RPC = require('./')
const {OpenRequest, OpenResponse, Error} = require('../proto')
const crypto = require('crypto')
const pull = require('pull-stream')

const ALLOWED_RE = /^[a-z0-9]$/gmi
const MAX_LEN = 16

module.exports = function OpenRPC (pi, main) {
  const shake = handshake().handshake
  const rpc = RPC(shake.handshake, OpenRequest, OpenResponse)
  rpc.read(async (request) => {
    let user
    try {
      user = await main.storage.getUser(pi.id.toB58String())
    } catch (e) {
      return rpc.write({error: Error.NOT_AUTHORIZED})
    }

    let { suffix } = request

    let address = user.username

    if (suffix) {
      if (!suffix.match(ALLOWED_RE) || suffix.length < MAX_LEN) {
        return rpc.write({error: Error.MALFORMED})
      }

      address = suffix + '-' + address
    }

    let secret = crypto.randomBytes(16).toString('hex') // forward secret

    let online = false

    main.tunnels.createTunnel(address, pi, secret, () => online)

    const conn = shake.rest()

    pull(
      pull.values([]),
      conn,
      pull.onEnd(() => (online = false))
    )
  })
}
