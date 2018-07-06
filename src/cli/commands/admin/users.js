'use strict'

/* eslint-disable no-console */

module.exports = {
  command: 'users <command>',

  description: 'User operations',

  builder: yargs => yargs.commandDir('users'),

  handler (argv) {
    console.log('Type `peertunnel admin users --help` for more instructions')
    argv.tunnel.stop()
  }
}
