'use strict'

/* eslint-disable no-console */

const TCP = require('libp2p-tcp')
const multiaddr = require('multiaddr')
const promisify = require('promisify-es6')

module.exports = {
  command: 'tunnel <address>',

  description: 'Create a tunnel',

  builder: {
    server: {
      desc: 'Server to open tunnel at',
      type: 'string'
    },
    suffix: {
      desc: 'Suffix to append to tunnel name',
      type: 'string'
    },
    address: {
      desc: 'Port, Address or Multiaddress to tunnel (TCP-only)',
      type: 'string',
      required: true
    }
  },

  async handler (argv) {
    const tcp = new TCP()
    const dial = promisify((addr, cb) => {
      const conn = tcp.dial(addr, (err) => {
        if (err) { return cb(err) }
        return cb(null, conn)
      })
    })

    const {tunnel, server, suffix, address} = argv
    const pi = server ? await tunnel.resolveServer(server) : await tunnel.resolveServerDefault()

    let addr
    let match

    // WARNING: way too much regex below here

    if (address.match(/^[0-9]+$/gmi)) { // PORT
      addr = multiaddr('/ip4/127.0.0.1/tcp/' + address)
    } else if ((match = address.match(/^((\d{1,3}\.){3,3}\d{1,3}):([0-9]{1,5})$/))) { // IP4:PORT
      addr = multiaddr('/ip4/' + match[1] + '/tcp/' + match[3])
    } else if ((match = address.match(/^\[((::)?(((\d{1,3}\.){3}(\d{1,3}){1})?([0-9a-f]){0,4}:{0,2}){1,8}(::)?)\]:([0-9]{1,5})$/i))) { // [IP6]:PORT
      addr = multiaddr('/ip6/' + match[1].toLowerCase() + '/tcp/' + match[9])
    } else if ((match = address.match(/^((([a-zA-Z]|[a-zA-Z][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9-]*[A-Za-z0-9])):([0-9]{1,5})$/i))) { // DNS:PORT
      addr = multiaddr('/dnsaddr/' + match[1].toLowerCase() + '/tcp/' + match[5])
    } else if (address.startsWith('/')) { // MULTIADDR
      try {
        addr = multiaddr(address) // parse as multiaddr
      } catch (e) {
        console.die(e.toString())
      }
    }

    if (!addr) {
      console.die('Address could not be decoded as PORT, IP4:PORT, [IP6]:PORT, DNS:PORT or MULTIADDR')
    }

    const openTunnel = () => {
      console.log('Opening tunnel for %s...'.blue, String(addr).bold)

      const handler = async (remote) => {
        console.log('Incoming connection: %o'.blue.bold, remote || '<unknown remote address>')
        return dial(addr)
      }

      const onClose = () => {
        console.log('Remote closed tunnel! Trying re-open in 1s...'.yellow)
        setTimeout(openTunnel, 1000)
      }

      tunnel.tunnels.createTunnel(pi, suffix, handler, onClose, (err, tunnel) => {
        if (err) {
          console.die('Failed to open tunnel: %s', err)
        }

        console.log('Tunnel %s now open!'.green, ('https://' + tunnel.address).bold)
      })
    }

    openTunnel()
  }
}
