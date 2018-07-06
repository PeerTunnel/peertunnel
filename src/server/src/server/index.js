'use strict'

const tls = require('tls')
const net = require('net')
const toPull = require('stream-to-pull-stream')
const debug = require('debug')
const Log = debug('peertunnel:server:tlsserver')
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
    const prefix = 'socket#' + Math.random().toString().replace(/[.0]/gmi, '').substr(0, 5) + ' '
    const log = (...a) => Log(prefix + a[0], ...a.slice(1))

    const next = async () => {
      const { zone } = secureSocket

      if (!zone) {
        log('error: no zone for socket, drop')
        return secureSocket.destroy()
      }

      log('continue')

      if (zone.user) {
        // open a tunnel
        this.main.tunnels.requestTunnel(zone.user, { voidOnError: true, remote: socket.address() }, (err, remote) => { // the complete magic of this thing
          if (err) { return log(err) } // shouldn't happen because voidOnError
          pull(conn, remote, conn)
          log('done forward')
        })
      } else if (zone.main) {
        // TODO: if (http.wsUpgrade) connectToSwarmViaWS() else if (http) showHomepage() else drop()
        log('TBD: main')
      } else {
        log('error: zone invalid, drop')
        return secureSocket.destroy()
      }
    }

    const SNICallback = (hostname, cb) => {
      log('do SNI for %s', hostname)

      if (!this.main.isInZone(hostname)) {
        return cb(new Error(hostname + ' is outside of our zone!'))
      }

      secureSocket.zone = {
        hostname,
        user: hostname.match(this.main.zoneUserRe) && hostname.match(this.main.zoneUserRe)[1],
        main: Boolean(hostname.match(this.main.zoneMainRe))
      }

      log('socket %o', secureSocket.zone)

      setImmediate(next) // HACK: TODO: figure out why secureConnect isn't firing

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

    secureSocket.on('secureConnect', next)
    const conn = toPull.duplex(secureSocket) // convert socket here to avoid these _funny_ "data got lost, you didn't pipe sync" bugs
  }

  async start () {
    await this.server.listen(this.listenOn)
  }
}

module.exports = TLSServer
