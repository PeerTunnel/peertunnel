'use strict'

const debug = require('debug')
const log = debug('peertunnel:server')

const Storage = require('./storage')

const pull = require('pull-stream')
const OpenRPC = require('./rpc/open')

class Server {
  constructor ({storage, swarm, admins, zone}) {
    this.swarm = swarm
    this.storage = new Storage(storage)
    this.admins = admins
    this.zone = zone
    this.zoneRe = new RegExp('^([a-z0-9_]\\.){0,1}' + zone + '$')
    this.zoneUserRe = new RegExp('^([a-z0-9_])\\.' + zone + '$')
    this.zoneMainRe = new RegExp('^' + zone + '$')
  }

  async start () {
    this.settings = await this.storage.getGlobal()
    this.cert = await this.storage.getCert()
    this.swarm.handle('/peertunnel/open/1.0.0', (proto, conn) => {
      conn.getPeerInfo((err, pi) => {
        if (err) { return log(err) }

        pull(
          conn,
          OpenRPC(pi),
          conn
        )
      })
    })
  }

  async stop () {

  }

  inZone (domain) {
    return Boolean(domain.match(this.zoneRe))
  }
}

module.exports = Server
