'use strict'

/* eslint-disable no-console */

module.exports = {
  command: 'set-default <name>',

  description: 'Set default server',

  builder: yargs => yargs,

  async handler (argv) {
    const {tunnel, name} = argv
    const {storage} = tunnel

    const servers = await storage.getServers()

    if (!servers.names[name]) {
      console.die('Server %s does not exist!', name)
    }

    servers.default = servers.names[name]

    await servers.save()

    console.error('Successfully changed default server to %s!'.green, name.bold)

    tunnel.stop()
  }
}
