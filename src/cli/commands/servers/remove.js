'use strict'

/* eslint-disable no-console */

module.exports = {
  command: 'remove <name>',

  description: 'Remove server',

  builder: yargs => yargs,

  async handler (argv) {
    const {tunnel, name} = argv
    const {storage} = tunnel

    const servers = await storage.getServers()

    if (!servers.names[name]) {
      console.die('Server %s does not exist!', name)
    }

    if (servers.default === servers.names[name]) {
      console.die('Server %s is the current default server!', name)
    }

    await (await storage.getServer(servers.names[name])).delete()
    delete servers.names[name]

    await servers.save()

    console.error('Successfully removed server %s!'.green, name.bold)
  }
}
