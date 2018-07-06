'use strict'

/* eslint-disable no-console */

const {OP} = require('../../../../common/proto')

module.exports = {
  command: 'add <id> [<username>]',

  description: 'Add a user',

  builder: {
    id: {
      desc: 'Id of user to add',
      type: 'string',
      required: true
    },
    username: {
      desc: 'Username to set as users username',
      type: 'string',
      required: true
    }
  },

  async handler (argv) {
    const {tunnel, server, id, username} = argv

    const pi = await tunnel.resolveServer(server)
    await tunnel.admin(pi, {
      type: OP.ADD,
      userId: id
    })
    if (username) {
      await tunnel.admin(pi, {
        type: OP.SET,
        userId: id,
        key: 'username',
        value: username
      })
    }

    console.error('Successfully added user %s!'.green, id.bold)

    tunnel.stop()
  }
}
