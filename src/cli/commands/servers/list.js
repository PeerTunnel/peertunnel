'use strict'

/* eslint-disable no-console */

module.exports = {
  command: 'list',

  description: 'List Servers',

  builder: yargs => yargs,

  async handler (argv) {
    const {tunnel} = argv
    const {storage} = tunnel

    const servers = await storage.getServers()

    const list = []

    for (let name in servers.names) {
      if (name) {
        const id = servers.names[name]
        if (servers.default === id) {
          name += ' (default)'
        }
        const addresses = (await storage.getServer(id)).addrs.join(', ')
        list.push({name, id, addresses})
      }
    }

    console.table(list)

    tunnel.stop()
  }
}
