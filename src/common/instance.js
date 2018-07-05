'use strict'

const libp2p = require('libp2p')
const TCP = require('libp2p-tcp')
const WS = require('libp2p-websockets')
const SPDY = require('libp2p-spdy')
const MPLEX = require('libp2p-mplex')
const SECIO = require('libp2p-secio')
const defaultsDeep = require('@nodeutils/defaults-deep')
const Id = require('peer-id')
const Peer = require('peer-info')

class Node extends libp2p {
  constructor (_peerInfo, _peerBook, _options) {
    const defaults = {
      peerInfo: _peerInfo, // The Identity of your Peer
      peerBook: _peerBook, // Where peers get tracked, if undefined libp2p will create one instance

      // The libp2p modules for this libp2p bundle
      modules: {
        transport: [
          TCP,
          WS
        ],
        streamMuxer: [
          SPDY,
          MPLEX
        ],
        connEncryption: [
          SECIO
        ]
      },

      // libp2p config options (typically found on a config.json)
      config: { // The config object is the part of the config that can go into a file, config.json.
        peerDiscovery: {},
        // peerRouting: {},
        // contentRouting: {},
        relay: { // Circuit Relay options
          enabled: true,
          hop: {
            enabled: true,
            active: false
          }
        },
        // Enable/Disable Experimental features
        EXPERIMENTAL: { // Experimental features ("behind a flag")
          pubsub: false,
          dht: false
        }
      }
    }

    // overload any defaults of your bundle using https://github.com/nodeutils/defaults-deep
    super(defaultsDeep(_options, defaults))
  }
}

module.exports = (config, def, cb) => {
  Id.createFromJSON(config.id, (err, id) => {
    if (err) { return cb(err) }

    const pi = new Peer(id)
    if (!config.addrs) config.addrs = def.addrs
    config.addrs.forEach(addr => pi.multiaddrs.add(addr))

    const swarm = new Node(pi)

    swarm.start((err) => cb(err, swarm))
  })
}

module.exports.create = (cb) => Id.create((err, id) => cb(err, {id}))
