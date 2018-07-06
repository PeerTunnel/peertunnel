'use strict'

/* eslint-disable no-console */

const multiaddr = require('multiaddr')

module.exports = {
  command: 'add <address> <name>',

  description: 'Add server',

  builder: {
    address: {
      desc: 'Address(es) of server',
      type: 'string',
      required: true
    },
    name: {
      desc: 'Name of server to add',
      type: 'string',
      required: true
    }
  },

  async handler (argv) {
    const {tunnel, address, name} = argv
    const {storage} = tunnel

    const addrs = address.split(',').filter(Boolean).map(multiaddr)
    const id = addrs[0].getPeerId()

    const servers = await storage.getServers()
    const server = await storage.getServer(id)

    if (server.addrs || servers.names[name]) {
      console.die('Server %s already exists (Id or Name already in use)!', name)
    }

    servers.names[name] = id
    server.addrs = address.split(',').filter(Boolean)

    if (!servers.default) {
      console.log('First server added! Using it as default...')
      console.log('Use " $ peertunnel servers set-default other-server " to change this')
      servers.default = id
    }

    await servers.save()
    await server.save()

    console.error('Successfully added %s!'.green, name.bold)

    tunnel.stop()
  }
}
