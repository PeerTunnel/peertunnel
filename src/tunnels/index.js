'use strict'

const ForwardRPC = require('../rpc/forward')
const OpenRPC = require('../rpc/open')
const pull = require('pull-stream')

class Tunnels {
  constructor (main) {
    this.main = main
    this.store = {}
  }

  async start () {
    this.main.swarm.handle('/peertunnel/forward/1.0.0', (proto, conn) => {
      pull(
        conn,
        ForwardRPC(this.store),
        conn
      )
    })
  }

  createTunnel (pi, suffix, handler, cb) {
    this.main.swarm.dialProtocol(pi, '/peerinfo/open/1.0.0', (err, conn) => {
      if (err) { return cb(err) }

      pull(
        conn,
        OpenRPC(suffix, handler, this, cb),
        conn
      )
    })
  }

  async stop () {
    this.main.swarm.unhandle('/peertunnel/forward/1.0.0')
    // TODO. track tunnel conns and shut them all down properly here
  }
}

module.exports = Tunnels
