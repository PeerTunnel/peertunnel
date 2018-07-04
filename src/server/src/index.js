'use strict'

const debug = require('debug')
const log = debug('peertunnel:server')

const Storage = require('./storage')
const Tunnels = require('./tunnels')
const TLSServer = require('./server')

const pull = require('pull-stream')
const OpenRPC = require('./rpc/open')
const AdminRPC = require('./rpc/admin')
const multiaddr = require('multiaddr')

class Server {
  constructor ({storage, publicAddr, swarm, admins, zone}) {
    this.swarm = swarm
    this.storage = new Storage(storage)
    this.tunnels = new Tunnels(this)
    this.server = new TLSServer({addr: multiaddr(publicAddr), main: this})
    this.admins = admins
    this.zone = zone
    this.zoneRe = new RegExp('^([a-z0-9]+\\.){0,1}' + zone + '$')
    this.zoneUserRe = new RegExp('^([a-z0-9]+)\\.' + zone + '$')
    this.zoneMainRe = new RegExp('^' + zone + '$')
  }

  async start () {
    this.settings = await this.storage.getGlobal()
    this.cert = await this.storage.getCert()
    await this.server.start()
    this.swarm.handle('/peertunnel/open/1.0.0', (proto, conn) => {
      conn.getPeerInfo((err, pi) => {
        if (err) { return log(err) }

        pull(
          conn,
          OpenRPC(pi, this),
          conn
        )
      })
    })
    this.swarm.handle('/peertunnel/admin/1.0.0', (proto, conn) => {
      conn.getPeerInfo((err, pi) => {
        if (err) { return log(err) }

        pull(
          conn,
          AdminRPC(pi, this.admins, this),
          conn
        )
      })
    })
  }

  async stop () {

  }

  isInZone (domain) {
    return Boolean(domain.match(this.zoneRe))
  }
}

module.exports = Server
