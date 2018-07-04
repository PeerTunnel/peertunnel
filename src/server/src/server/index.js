'use strict'

const tls = require('tls')
const net = require('net')
const toPull = require('stream-to-pull-stream')
const debug = require('debug')
const log = debug('peertunnel:server:tlsserver')
const pull = require('pull-stream')
const SSLConfig = require('ssl-config')('modern')

// We have to use a normal net server and upgrade conns to tls in order to associate conn and hostname

class TLSServer {
  constructor ({addr, main}) {
    this.listenOn = addr.nodeAddress()
    this.main = main // TODO: circular reference
    this.server = net.createServer(this.handler.bind(this))
  }

  handler (socket) {
    const next = async () => {
      const { zone } = secureSocket

      if (!zone) {
        log('error: no zone for socket, drop')
        return secureSocket.destroy()
      }

      if (zone.user) {
        // open a tunnel
        const conn = toPull(secureSocket)
        this.main.tunnels.requestTunnel(zone.user, { voidOnError: true }, (err, remote) => { // the complete magic of this thing
          if (err) { return log(err) } // shouldn't happen because voidOnError
          pull(conn, remote, conn)
        })
      } else if (zone.main) {
        // TODO: if (http.wsUpgrade) connectToSwarmViaWS() else if (http) showHomepage() else drop()
      } else {
        log('error: zone invalid, drop')
        return secureSocket.destroy()
      }
    }

    const SNICallback = (hostname, cb) => {
      log('do sni for %s', hostname)

      if (!this.main.isInZone(hostname)) {
        return cb(new Error(hostname + ' is outside of our zone!'))
      }

      secureSocket.zone = {
        hostname,
        user: hostname.match(this.main.zoneUserRe) && hostname.match(this.main.zoneUserRe)[1],
        main: Boolean(hostname.match(this.main.zoneMainRe))
      }

      log('socket %o', secureSocket.zone)

      cb(null, tls.createSecureContext(this.main.cert))
    }

    const secureSocket = new tls.TLSSocket(socket, Object.assign({
      isServer: true,
      server: this.server,
      SNICallback
    }, SSLConfig))

    // Avoid uncaught errors caused by unstable connections
    socket.on('error', log)
    secureSocket.on('error', log)
    secureSocket.once('secureConnect', next)
  }

  async start () {
    await this.server.listen(this.listenOn)
  }
}

module.exports = TLSServer
