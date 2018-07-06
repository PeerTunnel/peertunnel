'use strict'

/* eslint-disable no-console */

module.exports = {
  command: 'rename <prev-name> <new-name>',

  description: 'Rename server',

  builder: {
    'prev-name': {
      desc: 'Name of server to rename',
      type: 'string',
      required: true
    },
    'new-name': {
      desc: 'Name to rename server into',
      type: 'string',
      required: true
    }
  },

  async handler (argv) {
    const {tunnel, prevName, newName} = argv
    const {storage} = tunnel

    const servers = await storage.getServers()

    if (!servers.names[prevName]) {
      console.die('Server %s does not exist!', prevName)
    }

    if (servers.names[newName]) {
      console.die('Server %s already exists!', newName)
    }

    servers.names[newName] = servers.names[prevName]
    delete servers.names[prevName]

    await servers.save()

    console.error('Successfully renamed %s to %s!'.green, prevName.bold, newName.bold)

    tunnel.stop()
  }
}
