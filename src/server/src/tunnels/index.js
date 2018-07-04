'use strict'

const debug = require('debug')
const log = debug('peertunnel:server:tunnels')
const pull = require('pull-stream')

const ForwardRPC = require('../rpc/forward')

class Tunnels {
  constructor ({main}) {
    this.main = main // TODO: circular reference
    this.store = {}
  }

  createTunnel (id, pi, forwardSecret, keepOpen) {
    log('create tunnel %s', id)
    let address = id + '.' + this.main.zone
    this.store[id] = {pi, address, forwardSecret, keepOpen}
  }

  gc () {
    for (const id in this.store) {
      if (!this.store[id].keepOpen()) {
        log('gc\'ing tunnel %s', id)
        delete this.store[id]
      }
    }
  }

  requestTunnel (id, opt, cb) {
    if (opt && opt.voidOnError) {
      const _void = {
        source: (end, cb) => cb(end || true),
        sink: (read) => read(true)
      }

      const _cb = cb
      cb = (err, conn) => err ? _cb(null, _void) : _cb(null, conn) // should be "conn || _void", but linter....
    }

    log('requesting tunnel %s', id)

    const tunnel = this.store[id]

    if (typeof opt === 'function') {
      cb = opt
      opt = {}
    }

    if (!tunnel) {
      return cb(new Error('Tunnel ' + id + ' missing!'))
    }

    const conn = this.main.swarm.dialProtocol(tunnel.pi, '/peertunnel/forward/1.0.0')

    pull(
      conn,
      ForwardRPC(tunnel, opt && opt.remote, cb),
      conn
    )
  }
}

module.exports = Tunnels
