'use strict'

/* eslint-disable no-console */

const TCP = require('libp2p-tcp')
const multiaddr = require('multiaddr')
const pull = require('pull-stream')

module.exports = {
  command: 'tunnel [<server>] [<port>]',

  description: 'Create a tunnel',

  builder: yargs => yargs.option('server', {type: 'string'}).option('suffix', {type: 'string'}).option('port', {type: 'port'}).option('host', {type: 'string'}),

  async handler (argv) {
    const {tunnel, server, suffix, port, host} = argv

    const pi = await tunnel.resolveServer(server)
    const tcp = new TCP()
    const addr = multiaddr('/ip4/' + (host || '127.0.0.1') + '/tcp/' + port) // TODO: make this more flexible
    const handler = (conn, remote) => { // TODO: handle connection errors
      console.log('Incoming connection: %o'.blue.bold, remote || '<unknown remote address>')
      pull(conn, tcp.dial(addr), conn)
    }
    tunnel.tunnels.createTunnel(pi, suffix, handler, (err, tunnel) => {
      if (err) {
        console.die('Failed to open tunnel: %s', err)
      }

      console.log('Tunnel %s now open!'.green, ('https://' + tunnel.address).bold)
    })
  }
}
