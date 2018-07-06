'use strict'

/* eslint-disable no-console */

const {OP} = require('../../../../common/proto')

module.exports = {
  command: 'set-username <id> <username>',

  description: 'Set a user\'s username',

  builder: yargs => yargs,

  async handler (argv) {
    const {tunnel, server, id, username} = argv

    const pi = await tunnel.resolveServer(server)
    await tunnel.admin(pi, {
      type: OP.SET,
      userId: id,
      key: 'username',
      value: username
    })

    console.error('Successfully changed username of %s to %s!'.green, id.bold, username.bold)

    tunnel.stop()
  }
}
