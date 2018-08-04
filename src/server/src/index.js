'use strict'

const debug = require('debug')
const log = debug('peertunnel:server')

const prom = (fnc) => new Promise((resolve, reject) => fnc((err, res) => err ? reject(err) : resolve(res)))

const Storage = require('./storage')
const Tunnels = require('./tunnels')

const pull = require('pull-stream')
const OpenRPC = require('./rpc/open')
const AdminRPC = require('./rpc/admin')
const multiaddr = require('multiaddr')

const TCP = require('libp2p-tcp')
const {sortingHat} = require('teletunnel-core')
const fwAddr = require('forward-addr')
const protocols = require('teletunnel-protocols')({})
const fwAddrCustomCompare = (str, sslCompare) => {
  let addr = fwAddr.validate(fwAddr.parse(str), protocols)
  addr[1].conditions.hostname = {type: 'string', match: 'strict', value: sslCompare}
}

class Server {
  constructor ({storage, publicAddr, swarm, admins, zones, zone}) {
    this.swarm = swarm
    this.storage = new Storage(storage)
    this.tunnels = new Tunnels(this)
    this.publicAddr = multiaddr(publicAddr)
    this.admins = admins
    this.zones = zones || [zone]

    const tcp = new TCP()
    this.server = tcp.createListener(conn => sortingHat(conn, {protocols, handlers: this.handlers}))
  }

  async start () {
    this.settings = await this.storage.getGlobal()
    await prom(cb => this.server.listen(this.publicAddr, cb))
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

  static get handlers () {
    return [
      { // main domain
        address: fwAddrCustomCompare('/tcp/ssl' /* + /http/_ws/stream */, (value) => this.zones.indexOf(value) !== -1),
        handle: (conn) => {
          // TODO: emit swarm conn event
        }
      },
      { // user domains
        address: fwAddrCustomCompare('/tcp/ssl', (value) => this.zones.filter(zone => value.endsWith('.' + zone))),
        handle: (conn, state) => {
          let hostname = state[1][1].hostname
          let zone = this.zones.filter(zone => hostname.endsWith('.' + zone))[0]
          let userDomain = hostname.replace('.' + zone, '')
          conn.getObservedAddrs((addr) => {
            this.tunnels.requestTunnel(userDomain, { voidOnError: true, remote: addr.nodeOptions() }, (err, remote) => { // the complete magic of this thing
              if (err) { return log(err) } // shouldn't happen because voidOnError
              pull(conn, remote, conn)
              log('done forward')
            })
          })
        }
      }
    ]
  }

  async stop () {
    // TODO: close all conns
  }
}

module.exports = Server
