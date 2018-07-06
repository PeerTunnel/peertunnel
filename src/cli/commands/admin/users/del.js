'use strict'

/* eslint-disable no-console */

const {OP} = require('../../../../common/proto')

module.exports = {
  command: 'del <id>',

  description: 'Delete a user',

  builder: yargs => yargs,

  async handler (argv) {
    const {tunnel, server, id} = argv

    const pi = await tunnel.resolveServer(server)
    await tunnel.admin(pi, {
      type: OP.DEL,
      userId: id
    })

    console.error('Successfully deleted user %s!'.green, id.bold)

    tunnel.stop()
  }
}
